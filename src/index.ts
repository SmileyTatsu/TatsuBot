import "dotenv/config";

import {
    Client,
    GatewayIntentBits,
    Collection,
    AllowedMentionsTypes,
    ActivityType,
} from "discord.js";
import { loadEvents } from "./handlers/event-handler.js";
import { loadCommands } from "./handlers/command-handler.js";
import { imageQueue } from "./classes/image-que.js";
import { initQueue } from "./utils/init-queue.js";
import { initQuotaReset } from "./utils/init-quota-reset.js";

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    allowedMentions: {
        parse: [AllowedMentionsTypes.User],
    },
    presence: {
        activities: [
            {
                name: "hmph!",
                type: ActivityType.Listening,
            },
        ],
    },
});

// Custom collections for commands (I hate this so much but I am too lazy to do something better)
(client as any).commands = new Collection();
(client as any).slashCommands = new Collection();
(client as any).imageQueue = new imageQueue();
(client as any).imageUsage = new Collection<string, number>();
(client as any).inMaintenance = false;

(async () => {
    // Load handlers
    await loadEvents(client);
    await loadCommands(client);

    // Initialize the image queue
    initQueue((client as any).imageQueue, client);

    // Initialize the quota reset job
    initQuotaReset(client);

    // Login
    client.login(process.env.DISCORD_BOT_TOKEN);
})();
