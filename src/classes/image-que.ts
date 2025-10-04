import { NovelAIImageGenerationRequest, NovelAIRole } from "../types/index.js";
import { NOVELAI_PRIORITY_PER_ROLE } from "../utils/constants.js";

class PriorityQueue<T> {
    private items: { item: T; priority: number; enqueueTime: number }[] = [];

    enqueue(item: T, priority: number) {
        const queueElement = { item, priority, enqueueTime: Date.now() };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (
                this.getEffectivePriority(queueElement) >
                this.getEffectivePriority(this.items[i])
            ) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(queueElement);
        }
    }

    dequeue(): T | undefined {
        return this.items.shift()?.item;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    peekNextTen(): T[] {
        return this.items.slice(0, 10).map((element) => element.item);
    }

    isInQueue(item: T): boolean {
        return this.items.some((element) => element.item === item);
    }

    private getEffectivePriority(element: {
        priority: number;
        enqueueTime: number;
    }) {
        const decayInterval = 5000; // 5 seconds

        // Calculate how many decay intervals have passed since the item was enqueued
        // Each interval increases the effective priority by 1
        const age = Math.floor(
            (Date.now() - element.enqueueTime) / decayInterval
        );
        return element.priority + age;
    }
}

export class imageQueue {
    private queue: PriorityQueue<{
        data: { userId: string; channelId: string };
        request: NovelAIImageGenerationRequest;
        roles: string[];
    }>;

    constructor() {
        this.queue = new PriorityQueue();
    }

    enqueue(
        userId: string,
        channelId: string,
        request: NovelAIImageGenerationRequest,
        roles: string[]
    ) {
        let highestPriority = NOVELAI_PRIORITY_PER_ROLE["default"];
        for (const role of roles) {
            const rolePriority = NOVELAI_PRIORITY_PER_ROLE[role as NovelAIRole];
            if (rolePriority && rolePriority > highestPriority) {
                highestPriority = rolePriority;
            }
        }
        this.queue.enqueue(
            { data: { userId, channelId }, request, roles },
            highestPriority
        );
    }

    dequeue() {
        return this.queue.dequeue();
    }

    isEmpty() {
        return this.queue.isEmpty();
    }

    size() {
        return this.queue.size();
    }

    peekNextTenIds() {
        return this.queue.peekNextTen().map((element) => element.data.userId);
    }

    isUserInQueue(userId: string) {
        return this.queue.isInQueue({
            data: { userId, channelId: "" },
            request: { prompt: "", options: {} },
            roles: [],
        });
    }
}
