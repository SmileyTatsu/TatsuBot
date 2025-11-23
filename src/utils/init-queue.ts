import {
    Client,
    Collection,
    EmbedBuilder,
    MessageCreateOptions,
    MessagePayload,
    TextChannel,
} from "discord.js";
import { imageQueue } from "../classes/image-que.js";
import { NovelAIManager } from "../classes/novelai-manager.js";

const novelAI = new NovelAIManager(process.env.NOVELAI_API_KEY || "");

export async function initQueue(queue: imageQueue, client: Client) {
    console.log("Image queue worker initialized.");

    while (true) {
        if (!queue.isEmpty()) {
            const job = queue.dequeue();
            if (job) {
                const {
                    data: { userId, channelId },
                    request,
                    roles,
                } = job;
                console.log(
                    `Processing job for user ${userId} with roles: ${roles.join(
                        ", "
                    )}`
                );

                // If no seed is provided, generate a random one
                const seed =
                    request.options?.seed ||
                    Math.floor(Math.random() * 1000000);
                request.options = { ...request.options, seed };

                try {
                    const imageBase64 = await novelAI.generateImage(request);
                    const user = await client.users
                        .fetch(userId)
                        .catch(() => null);
                    const channel = await client.channels
                        .fetch(channelId)
                        .catch(() => null);

                    if (!user) {
                        console.error(`User not found: ${userId}`);
                        return;
                    } else if (!channel) {
                        console.error(`Channel not found: ${channelId}`);
                        return;
                    } else if (!channel || !channel.isTextBased()) {
                        console.error(
                            `Channel ${channelId} not found or is not a text channel.`
                        );
                        return;
                    }

                    const embed = new EmbedBuilder()
                        .setDescription(
                            [
                                "```diff",
                                `+ Prompt: ${request.prompt}`,
                                `- Negative Prompt: ${
                                    request.options?.negative_prompt || "None"
                                }`,
                                "```",
                                "```",
                                `> Steps: ${request.options?.steps || 23}`,
                                `> Resolution: ${
                                    request.options?.width || 1024
                                }x${request.options?.height || 1024}`,
                                `> Sampler: ${
                                    request.options?.sampler ||
                                    "k_euler_ancestral"
                                }`,
                                `> Scheduler: ${
                                    request.options?.scheduler || "karras"
                                }`,
                                `> Seed: ${request.options?.seed}`,
                                "",
                                `> CFG Rescale: ${
                                    request.options?.cfg_rescale || 0
                                }`,
                                `> CFG: ${request.options?.scale || 5}`,
                                "```",
                            ].join("\n")
                        )
                        .setURL("https://discord.gg/eUgkbjmarK")
                        .setColor("Random")
                        .setTimestamp();

                    const message: MessagePayload | MessageCreateOptions = {
                        content: `<@${userId}> Here is your generated image!`,
                        embeds:
                            request.extra?.hide_embed === true ? [] : [embed],
                        files: [
                            {
                                attachment: Buffer.from(imageBase64, "base64"),
                                name: "image.png",
                            },
                        ],
                    };

                    await (channel as TextChannel).send(message);

                    // If everything is successful, increment the user's usage count
                    const imageUsage = (client as any).imageUsage as Collection<
                        string,
                        number
                    >;
                    const currentUsage = imageUsage.get(userId) || 0;
                    imageUsage.set(userId, currentUsage + 1);
                } catch (error) {
                    console.error(
                        `Error processing job for user ${userId}:`,
                        error
                    );
                }
            }
        } else {
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}
