import { EmbedBuilder } from "discord.js";
import { TextCommand } from "../../types/index.js";
import { imageQueue } from "../../classes/image-que.js";

const command: TextCommand = {
    name: "nai-queue",
    description: "Check your position in the NovelAI image generation queue.",
    async execute(message, args) {
        const imageQueue = (message.client as any).imageQueue as imageQueue;
        const position = imageQueue.getUserPosition(message.author.id);

        if (position === -1) {
            return message.reply(
                "You are not currently in the image generation queue."
            );
        }

        const queueSize = imageQueue.size();

        const nextTen = imageQueue.peekNextTenIdsAndPriorities();
        const embed = new EmbedBuilder()
            .setTitle("NovelAI Image Generation Queue")
            .setDescription(
                [
                    `You are currently **#${position + 1}** in the queue.`,
                    "",
                    `**Next ${queueSize} in Queue:**\n${nextTen.map(
                        (entry, index) =>
                            `${index + 1}. <@${entry.userId}> (Priority: ${
                                entry.priority
                            })`
                    )}`,
                ].join("\n")
            );

        await message.reply({ embeds: [embed] });
    },
};

export default command;
