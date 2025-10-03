import type { Message } from "discord.js";
import type { TextCommand } from "../../types/index.js";

const command: TextCommand = {
    name: "ping",
    description: "Replies with Pong!",
    async execute(message: Message) {
        await message.reply("Pong!");
    },
};

export default command;
