import { EmbedBuilder, type Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";
import {
    NOVELAI_IMAGE_GENERATION_MODELS,
    NOVELAI_SAMPLERS,
    NOVELAI_SCHEDULERS,
    NOVELAI_RESOLUTIONS,
} from "../../utils/constants.js";

const command: TextCommand = {
    name: "nai-how",
    description: "How to use the NovelAI image generation command.",
    async execute(message: Message) {
        const modelList = NOVELAI_IMAGE_GENERATION_MODELS.join(", ");
        const samplerList = NOVELAI_SAMPLERS.join(", ");
        const schedulerList = NOVELAI_SCHEDULERS.join(", ");
        const resolutionList = Object.keys(NOVELAI_RESOLUTIONS).join(", ");

        const embed = new EmbedBuilder()
            .setTitle("How to use `!nai` — Image Generation Command")
            .setColor("Random")
            .setDescription(
                [
                    "**Quick usage**",
                    "```",
                    "!nai <prompt> [options]",
                    "```",
                    "",
                    "**Options** (use angle brackets anywhere in the command):",
                    "",
                    `• **model** — choose model: \`${modelList}\``,
                    `• **negative_prompt** — text to avoid (string)`,
                    `• **resolution** — \`${resolutionList}\` (portrait / landscape / square)`,
                    `• **scale** — number 0-10 (guides fidelity)`,
                    `• **cfg_rescale** — number 0-1`,
                    `• **seed** — integer seed for reproducible results`,
                    `• **sampler** — choose sampler: \`${samplerList}\``,
                    `• **scheduler** — choose scheduler: \`${schedulerList}\``,
                    `• **steps** — integer 1-28`,
                    `• **variety_plus** — "true" or "false"`,
                    "",
                    "**Example**",
                    "```",
                    "!nai A cute fox in a sunlit forest <resolution:portrait> <scale:7.5> <sampler:k_euler_ancestral> <steps:20>",
                    "```",
                    "",
                    "**Notes**",
                    "- If you omit resolution, a 1024x1024 image is used by default.",
                    "- The proper way to prompt is using booru-style tagging and/or small sentences.",
                    "- Add `fur_dataset` at the beginning of your prompt if you want more animal/furry-focused results.",
                    "",
                    "If you want to see your place in the queue use `!nai-queue`, and to check daily usage use `!nai-usage`.",
                ].join("\n")
            )
            .setFooter({
                text: "Have fun generating images!",
            })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};

export default command;
