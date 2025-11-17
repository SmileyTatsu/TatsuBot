import { EmbedBuilder, type Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";
import { DEV_IDS } from "../../utils/constants.js";

const command: TextCommand = {
    name: "dev-maintenance",
    description: "Set the image generation queue to maintenance (dev only).",
    async execute(message: Message) {
        const authorId = message.author.id;
        const allowed = DEV_IDS;

        if (!allowed.includes(authorId)) {
            return;
        }

        // Switch maintenance mode
        const maintenanceStatus = (message.client as any).inMaintenance;
        (message.client as any).inMaintenance = !(message.client as any)
            .inMaintenance;

        const embed = new EmbedBuilder()
            .setTitle(
                maintenanceStatus
                    ? "Maintenance Disabled"
                    : "Maintenance Enabled"
            )
            .setColor(maintenanceStatus ? "Red" : "Green")
            .setDescription(
                "The image generation queue has been set to **maintenance**. New requests will be paused."
            )
            .setFooter({ text: "Dev command executed" })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};

export default command;
