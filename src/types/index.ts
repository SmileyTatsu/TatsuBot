import {
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import { NOVELAI_PRIORITY_PER_ROLE } from "../utils/constants.js";

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

export interface NovelAIImageGenerationOptions {
    model?: string;
    negative_prompt?: string;
    height?: number;
    width?: number;
    scale?: number;
    cfg_rescale?: number;
    seed?: number;
    sampler?: string;
    scheduler?: string;
    steps?: number;
    variety_plus?: boolean;
}

export interface NovelAIImageGenerationRequest {
    prompt: string;
    options?: NovelAIImageGenerationOptions;
}

export type NovelAIRole = keyof typeof NOVELAI_PRIORITY_PER_ROLE;
