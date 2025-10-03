import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";

export async function loadCommands(client: Client) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const textCommandsPath = path.join(__dirname, "..", "commands", "text");
    const slashCommandsPath = path.join(__dirname, "..", "commands", "slash");

    (client as any).commands = new Collection();
    (client as any).slashCommands = new Collection();

    // Load text commands
    if (readdirSync(textCommandsPath).length > 0) {
        const textFiles = readdirSync(textCommandsPath).filter(
            (file) =>
                (file.endsWith(".ts") && !file.endsWith(".d.ts")) ||
                file.endsWith(".js")
        );
        for (const file of textFiles) {
            const filePath = path.join(textCommandsPath, file);
            const { default: command } = await import(
                pathToFileURL(filePath).href
            );
            if (!command?.name || !command?.execute) continue;
            (client as any).commands.set(command.name, command);
        }
    }

    // Load slash commands
    if (readdirSync(slashCommandsPath).length > 0) {
        const slashFiles = readdirSync(slashCommandsPath).filter(
            (file) =>
                (file.endsWith(".ts") && !file.endsWith(".d.ts")) ||
                file.endsWith(".js")
        );
        for (const file of slashFiles) {
            const filePath = path.join(slashCommandsPath, file);
            const { default: command } = await import(
                pathToFileURL(filePath).href
            );
            if (!command?.data || !command?.execute) continue;
            (client as any).slashCommands.set(command.data.name, command);
        }
    }
}
