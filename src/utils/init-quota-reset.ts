import { CronJob } from "cron";

export function initQuotaReset(client: any) {
    new CronJob(
        "0 0 0 * * *",
        () => {
            const imageUsage = client.imageUsage as Map<string, number>;
            imageUsage.clear();
            console.log("Image usage counts have been reset.");
        },
        null,
        true,
        "America/Mexico_City"
    );

    console.log("Quota reset job initialized.");
}
