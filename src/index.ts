import {
    Client,
    GatewayIntentBits,
    Collection,
    AllowedMentionsTypes,
    ActivityType,
} from "discord.js";
import dotenv from "dotenv";
import { loadEvents } from "./handlers/event-handler.js";
import { loadCommands } from "./handlers/command-handler.js";

dotenv.config();

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

async () => {
    // Load handlers
    await loadEvents(client);
    await loadCommands(client);

    // Login
    client.login(process.env.DISCORD_BOT_TOKEN);
};
