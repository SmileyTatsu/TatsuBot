import { EmbedBuilder, type Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";
import { imageQueue } from "../../classes/image-que.js";

const command: TextCommand = {
    name: "generate-image",
    description: "Generates an image based on a prompt using NovelAI.",
    async execute(message: Message, args: string[]) {
        console.log("generate-image command invoked.");
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

        imageQueue.enqueue(
            message.author.id,
            message.channel.id,
            { prompt, options: {} },
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
            .setTimestamp();

        await message.reply({
            content: "Your image is being generated...",
            embeds: [embed],
        });
    },
};

export default command;
