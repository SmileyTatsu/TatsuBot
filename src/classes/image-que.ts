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

    peekNextTenWithPriority(): { item: T; priority: number }[] {
        return this.items.slice(0, 10).map((element) => ({
            item: element.item,
            priority: this.getEffectivePriority(element),
        }));
    }

    isInQueue(item: T): boolean {
        return this.items.some((element) => element.item === item);
    }

    getUserPosition(userId: string): number {
        for (let i = 0; i < this.items.length; i++) {
            const element = this.items[i];
            if ((element.item as any).data.userId === userId) {
                return i;
            }
        }
        return -1;
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

    peekNextTenIdsAndPriorities() {
        return this.queue.peekNextTenWithPriority().map((element) => ({
            userId: element.item.data.userId,
            priority: element.priority,
        }));
    }

    isUserInQueue(userId: string) {
        return this.queue.isInQueue({
            data: { userId, channelId: "" },
            request: { prompt: "", options: {} },
            roles: [],
        });
    }

    getUserPosition(userId: string) {
        return this.queue.getUserPosition(userId);
    }
}
