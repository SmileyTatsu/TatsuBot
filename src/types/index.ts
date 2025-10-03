import {
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js";

export interface TextCommand {
    name: string;
    description?: string;
    aliases?: string[];
    execute: (message: Message, args: string[]) => Promise<any>;
}

export interface SlashCommand {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
}

export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<any>;
}
