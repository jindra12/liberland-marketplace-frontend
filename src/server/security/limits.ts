import { E_ALREADY_LOCKED, Semaphore, tryAcquire } from "async-mutex";
import { MAX_ACTIVE_REQUESTS } from "./constants";

const createSlotPool = (capacity: number) => {
    const slots = tryAcquire(new Semaphore(capacity));
    return async (): Promise<(() => void) | null> => {
        try {
            const [, release] = await slots.acquire();
            return release;
        } catch (error) {
            if (error === E_ALREADY_LOCKED) {
                return null;
            }
            throw error;
        }
    };
};

export const acquireRequestSlot = createSlotPool(MAX_ACTIVE_REQUESTS);
export const acquireNotificationSlot = createSlotPool(MAX_ACTIVE_REQUESTS);
