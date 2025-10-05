import { TextCommand } from "../../types/index.js";

const command: TextCommand = {
    name: "nai-usage",
    description: "Check your current NovelAI image generation usage.",
    async execute(message, args) {
        const imageUsage = (message.client as any).imageUsage as Map<
            string,
            number
        >;
        const currentUsage = imageUsage.get(message.author.id) || 0;

        message.reply(
            `You have generated ${currentUsage} images so far today.`
        );
    },
};

export default command;
