import { EmbedBuilder, type Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";
import { imageQueue } from "../../classes/image-que.js";
import { NOVELAI_USAGE_LIMITS_PER_ROLE } from "../../utils/constants.js";

const command: TextCommand = {
    name: "nai",
    description: "Generates an image based on a prompt using NovelAI.",
    async execute(message: Message, args: string[]) {
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

        // Enqueue the request
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
