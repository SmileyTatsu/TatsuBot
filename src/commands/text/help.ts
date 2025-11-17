import { EmbedBuilder, type Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";

const command: TextCommand = {
    name: "help",
    description: "Show basic available commands.",
    async execute(message: Message) {
        const embed = new EmbedBuilder()
            .setTitle("Help — Basic Commands")
            .setColor("Random")
            .setDescription(
                [
                    "**Available commands**",
                    "",
                    "• `!help` — show this message",
                    "• `!ping` — check bot latency",
                    "• `!nai` — generate an image with",
                    "• `!nai-how` — how to use the `!nai` command",
                    "• `!nai-queue` — view your place in the generation queue",
                    "• `!nai-usage` — check daily usage",
                ].join("\n")
            )
            .setFooter({ text: "TatsuBot — basic command list" })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};

export default command;
