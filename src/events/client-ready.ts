import { Client } from "discord.js";
import type { Event } from "../types/index.js";

const event: Event = {
    name: "clientReady",
    once: true,
    async execute(client: Client) {
        console.log(`✅ Logged in as ${client.user?.tag}`);
    },
};

export default event;
