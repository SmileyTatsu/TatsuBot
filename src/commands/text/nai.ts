import { EmbedBuilder, type Message } from "discord.js";
import type {
    NovelAIImageGenerationRequest,
    TextCommand,
} from "../../types/index.js";
import { imageQueue } from "../../classes/image-que.js";
import {
    NOVELAI_USAGE_LIMITS_PER_ROLE,
    NOVELAI_IMAGE_GENERATION_MODELS,
    NOVELAI_SAMPLERS,
    NOVELAI_SCHEDULERS,
    NOVELAI_RESOLUTIONS,
} from "../../utils/constants.js";

const command: TextCommand = {
    name: "nai",
    description: "Generates an image based on a prompt using NovelAI.",
    async execute(message: Message, args: string[]) {
        if ((message.client as any).inMaintenance) {
            return message.reply(
                "The image generation queue is currently under maintenance. Please try again later."
            );
        }

        const prompt = args.join(" ");
        const imageQueue = (message.client as any).imageQueue as imageQueue;

        if (!prompt) {
            return message.reply(
                "Please provide a prompt for image generation."
            );
        }

        // Check if user is already in the queue
        if (imageQueue.isUserInQueue(message.author.id)) {
            return message.reply(
                "You already have a pending image generation request in the queue."
            );
        }

        // Fetch in case Discord.JS cache is being shitty
        const member = await message.member?.fetch();
        const roles = member?.roles.cache.map((role) => role.name) || [];

        // Check usage limits
        const imageUsage = (message.client as any).imageUsage as Map<
            string,
            number
        >;
        const currentUsage = imageUsage.get(message.author.id) || 0;
        const maxUsage = roles.reduce((max, role) => {
            const limit =
                NOVELAI_USAGE_LIMITS_PER_ROLE[
                    role as keyof typeof NOVELAI_USAGE_LIMITS_PER_ROLE
                ];
            if (limit === -1) return -1;
            return Math.max(max, limit);
        }, 0);

        if (maxUsage !== -1 && currentUsage >= maxUsage) {
            return message.reply(
                `You have reached your image generation limit of ${maxUsage} images. Wait for the next day.`
            );
        }

        let naiRequest: NovelAIImageGenerationRequest;
        try {
            naiRequest = parseNovelAIPrompt(prompt);
        } catch (error: any) {
            return message.reply(error.message);
        }

        // Enqueue the request
        imageQueue.enqueue(
            message.author.id,
            message.channel.id,
            naiRequest,
            roles
        );

        const queuePosition = imageQueue.size();
        const nextTen = imageQueue.peekNextTenIdsAndPriorities();

        const embed = new EmbedBuilder()
            .setTitle("Image Generation Queue")
            .setDescription(
                [
                    `You are currently number **${queuePosition}** in the queue.`,
                    "",
                    `**Next 10 in Queue:**\n${nextTen
                        .map(
                            (entry, index) =>
                                `${index + 1}. <@${entry.userId}> (Priority: ${
                                    entry.priority
                                })`
                        )
                        .join("\n")}`,
                ].join("\n")
            )
            .setFooter({
                text:
                    maxUsage === -1
                        ? "Unlimited Usage! Thanks for supporting."
                        : `Daily usage: ${currentUsage}/${maxUsage}`,
            })
            .setTimestamp();

        await message.reply({
            content: "Your image is being generated...",
            embeds: [embed],
        });
    },
};

function parseNovelAIPrompt(input: string): NovelAIImageGenerationRequest {
    const NAIRequest: NovelAIImageGenerationRequest = {
        prompt: "",
        options: {},
        extra: {
            enhance_prompt: true,
        },
    };
    const errors: string[] = [];

    const optionRegex = /<(\w+):([^>]+)>/g;
    const prompt = input
        .replace(optionRegex, (_, key, value) => {
            value = value.trim().toLowerCase();

            switch (key) {
                case "model":
                    if (NOVELAI_IMAGE_GENERATION_MODELS.includes(value)) {
                        NAIRequest.options!.model = value;
                    } else {
                        errors.push(
                            `- Invalid model: ${value}. Must be one of: ${NOVELAI_IMAGE_GENERATION_MODELS.join(
                                ", "
                            )}`
                        );
                    }
                    break;

                case "negative_prompt":
                    NAIRequest.options!.negative_prompt = value;
                    break;

                case "resolution":
                    const resolution = NOVELAI_RESOLUTIONS[value];
                    if (resolution) {
                        NAIRequest.options!.width = resolution.width;
                        NAIRequest.options!.height = resolution.height;
                    } else {
                        errors.push(
                            `- Invalid resolution: ${value}. Must be one of: ${Object.keys(
                                NOVELAI_RESOLUTIONS
                            ).join(", ")}`
                        );
                    }
                    break;

                case "scale":
                    const scale = parseFloat(value);
                    if (!isNaN(scale) && scale >= 0 && scale <= 10) {
                        NAIRequest.options!.scale = scale;
                    } else {
                        errors.push(
                            `- Invalid scale: ${value}. Must be a number between 0 and 10.`
                        );
                    }
                    break;

                case "cfg_rescale":
                    const cfgRescale = parseFloat(value);
                    if (
                        !isNaN(cfgRescale) &&
                        cfgRescale >= 0 &&
                        cfgRescale <= 1
                    ) {
                        NAIRequest.options!.cfg_rescale = cfgRescale;
                    } else {
                        errors.push(
                            `- Invalid cfg_rescale: ${value}. Must be a number between 0 and 1.`
                        );
                    }
                    break;

                case "seed":
                    const seed = parseInt(value);
                    if (!isNaN(seed)) {
                        NAIRequest.options!.seed = seed;
                    } else {
                        errors.push(
                            `- Invalid seed: ${value}. Must be a valid number.`
                        );
                    }
                    break;

                case "sampler":
                    if (NOVELAI_SAMPLERS.includes(value)) {
                        NAIRequest.options!.sampler = value;
                    } else {
                        errors.push(
                            `- Invalid sampler: ${value}. Must be one of: ${NOVELAI_SAMPLERS.join(
                                ", "
                            )}`
                        );
                    }
                    break;

                case "scheduler":
                    if (NOVELAI_SCHEDULERS.includes(value)) {
                        NAIRequest.options!.scheduler = value;
                    } else {
                        errors.push(
                            `- Invalid scheduler: ${value}. Must be one of: ${NOVELAI_SCHEDULERS.join(
                                ", "
                            )}`
                        );
                    }
                    break;

                case "steps":
                    const steps = Number(value);
                    if (!isNaN(steps) && steps >= 1 && steps <= 28) {
                        NAIRequest.options!.steps = steps;
                    } else {
                        errors.push(
                            `- Invalid steps: ${value}. Must be a number between 1 and 28.`
                        );
                    }
                    break;

                case "variety_plus":
                    if (value === "true" || value === "false") {
                        NAIRequest.options!.variety_plus = value === "true";
                    } else {
                        errors.push(
                            `- Invalid variety_plus: ${value}. Must be "true" or "false".`
                        );
                    }
                    break;

                case "enhance_prompt":
                    if (value === "true" || value === "false") {
                        NAIRequest.extra!.enhance_prompt = value === "true";
                    } else {
                        errors.push(
                            `- Invalid enhance_prompt: ${value}. Must be "true" or "false".`
                        );
                    }
                    break;

                default:
                    errors.push(`- Unknown option: ${key}`);
                    break;
            }

            return "";
        })
        .trim()
        .replace(/,$/, ""); // Remove trailing comma if any

    if (errors.length > 0) {
        throw new Error(
            `There were errors parsing your prompt options:\n${errors.join(
                "\n"
            )}`
        );
    }

    if (
        NAIRequest.options!.width === undefined ||
        NAIRequest.options!.height === undefined
    ) {
        NAIRequest.options!.width = 1024;
        NAIRequest.options!.height = 1024;
    }

    let finalPrompt = prompt;
    if (NAIRequest.extra!.enhance_prompt) {
        finalPrompt =
            `${finalPrompt}, very aesthetic, masterpiece, no text`.trim();

        NAIRequest.options!.negative_prompt = `${
            NAIRequest.options?.negative_prompt ?? ""
        }, blurry, lowres, upscaled, artistic error, film grain, scan artifacts, bad anatomy, bad hands, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, halftone, multiple views, logo, too many watermarks, @_@, mismatched pupils, glowing eyes, negative space, blank page`;
    }

    return { ...NAIRequest, prompt: finalPrompt };
}

export default command;
