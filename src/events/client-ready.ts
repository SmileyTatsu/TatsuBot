import { Client, Events } from "discord.js";
import type { Event } from "../types/index.js";

const event: Event = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        console.log(`✅ Logged in as ${client.user?.tag}`);
    },
};

export default event;
