import { Events, Message } from "discord.js";
import type { Event } from "../types/index.js";
import { GUILD_ID } from "../utils/constants.js";

const event: Event = {
    name: Events.MessageCreate,
    async execute(message: Message, client) {
        if (message.guildId !== GUILD_ID) return;

        if (message.author.bot) return;

        const prefix = "!";
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = (client as any).commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply("There was an error executing that command.");
        }
    },
};

export default event;
