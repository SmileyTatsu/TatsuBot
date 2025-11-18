import JSZip from "jszip";
import {
    NOVELAI_BASE_URL,
    NOVELAI_IMAGE_GENERATION_MODELS,
    NOVELAI_SAMPLERS,
    NOVELAI_SCHEDULERS,
} from "../utils/constants.js";
import { NovelAIImageGenerationRequest } from "../types/index.js";

export class NovelAIManager {
    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("NovelAI API key is required");
        }

        this.apiKey = apiKey;
    }

    async generateImage({
        prompt,
        options,
        extra,
    }: NovelAIImageGenerationRequest): Promise<string> {
        const generateUrl = `${NOVELAI_BASE_URL}/ai/generate-image`;

        if (
            options?.model &&
            !NOVELAI_IMAGE_GENERATION_MODELS.includes(options.model)
        ) {
            throw new Error(`Invalid model: ${options.model}`);
        }

        if (options?.sampler && !NOVELAI_SAMPLERS.includes(options.sampler)) {
            throw new Error(`Invalid sampler: ${options.sampler}`);
        }

        if (
            options?.scheduler &&
            !NOVELAI_SCHEDULERS.includes(options.scheduler)
        ) {
            throw new Error(`Invalid scheduler: ${options.scheduler}`);
        }

        console.log("Generating image with options:", options);

        if (extra?.enhance_prompt) {
            prompt = `${prompt}, very aesthetic, masterpiece, no text`;
            options!.negative_prompt = `${
                options?.negative_prompt ?? ""
            }, blurry, lowres, upscaled, artistic error, film grain, scan artifacts, bad anatomy, bad hands, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, halftone, multiple views, logo, too many watermarks, @_@, mismatched pupils, glowing eyes, negative space, blank page,`;
        }

        const finalPrompt = prompt;

        const body = {
            action: "generate",
            input: finalPrompt,
            model: options?.model ?? "nai-diffusion-4-5-full",
            parameters: {
                params_version: 3,

                // User Values
                negative_prompt: options?.negative_prompt ?? "",
                width: options?.width ?? 1024,
                height: options?.height ?? 1024,
                scale: options?.scale ?? 5,
                cfg_rescale: options?.cfg_rescale ?? 0,

                sampler: options?.sampler ?? "k_euler_ancestral",
                noise_schedule: options?.scheduler ?? "karras",
                steps: options?.steps ?? 23,
                seed: options?.seed ?? Math.floor(Math.random() * 1000000),

                skip_cfg_above_sigma: options?.variety_plus ? 19 : null,

                v4_prompt: {
                    caption: {
                        base_caption: finalPrompt,
                        char_captions: [],
                    },
                    use_coords: false,
                    use_order: true,
                },
                v4_negative_prompt: {
                    caption: {
                        base_caption: options?.negative_prompt ?? "",
                        char_captions: [],
                    },
                },

                // Constant Values
                n_samples: 1,
                controlnet_strength: 1,
                legacy: false,
                add_original_image: true,
                legacy_v3_extend: false,
                normalize_reference_strength_multiple: false,
                inpaintImg2ImgStrength: 1,

                reference_image_multiple: [],
                reference_information_extracted_multiple: [],
                reference_strength_multiple: [],

                use_coords: false,
                ucPreset: 4, // None
                qualityToggle: false,

                // Not available on 4.5 but leaving here for the future :surely:
                dynamic_thresholding: false,
            },
        };

        console.log("Request body:", body);

        try {
            const res = await fetch(generateUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`NovelAI error: ${res.status} - ${text}`);
            }

            const archiveBuffer = await res.arrayBuffer();
            const imageBuffer = await this.extractFileFromZipBuffer(
                archiveBuffer,
                ".png"
            );

            if (!imageBuffer) {
                throw new Error(
                    "NovelAI generated an image, but PNG was not found in response."
                );
            }

            return imageBuffer.toString("base64");
        } catch (err) {
            console.error("NovelAIManager.generateImage failed:", err);
            throw err;
        }
    }

    // Extract PNG from ZIP response
    private async extractFileFromZipBuffer(
        buffer: ArrayBuffer,
        ext: string
    ): Promise<Buffer | null> {
        const zip = await JSZip.loadAsync(buffer);
        for (const filename of Object.keys(zip.files)) {
            if (filename.endsWith(ext)) {
                const file = zip.files[filename];
                if (file) {
                    return file.async("nodebuffer");
                }
            }
        }
        return null;
    }
}
