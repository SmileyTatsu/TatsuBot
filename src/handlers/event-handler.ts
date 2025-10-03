import { Client } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";

export async function loadEvents(client: Client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const eventsPath = path.join(__dirname, "..", "events");
    const eventFiles = readdirSync(eventsPath).filter(
        (file) =>
            (file.endsWith(".ts") && !file.endsWith(".d.ts")) ||
            file.endsWith(".js")
    );

    for (const file of eventFiles) {
        let filePath = path.join(eventsPath, file);
        const { default: event } = await import(pathToFileURL(filePath).href);

        if (!event?.name || !event?.execute) continue;

        if (event.once) {
            client.once(event.name, (...args) =>
                event.execute(...args, client)
            );
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}
