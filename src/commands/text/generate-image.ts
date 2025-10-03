import type { Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";
import { NovelAIManager } from "../../classes/novelai-manager.js";

const novelAI = new NovelAIManager(process.env.NOVELAI_API_KEY || "");

const command: TextCommand = {
    name: "generate-image",
    description: "Generates an image based on a prompt using NovelAI.",
    async execute(message: Message, args: string[]) {
        const prompt = args.join(" ");

        try {
            const imageBase64 = await novelAI.generateImage(prompt);

            console.log("Image generated successfully");
            await message.reply({
                files: [
                    {
                        attachment: Buffer.from(imageBase64, "base64"),
                        name: "image.png",
                    },
                ],
            });
        } catch (error) {
            console.error("Error generating image:", error);
            await message.reply("Failed to generate image.");
        }
    },
};

export default command;
