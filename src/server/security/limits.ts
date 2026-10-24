import { E_ALREADY_LOCKED, Semaphore, tryAcquire } from "async-mutex";
import { MAX_ACTIVE_REQUESTS } from "./constants";

const requestSlots = tryAcquire(new Semaphore(MAX_ACTIVE_REQUESTS));

export const acquireRequestSlot = async (): Promise<(() => void) | null> => {
    try {
        const [, release] = await requestSlots.acquire();
        return release;
    } catch (error) {
        if (error === E_ALREADY_LOCKED) {
            return null;
        }
        throw error;
    }
};
