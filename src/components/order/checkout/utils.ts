import { z } from "zod";
import type { CartSecretEntry } from "../../cart/cartSecrets";
import { normalizeSyndicationUrl } from "../../endpoints/utils";

const checkoutSchema = z.object({
    carts: z
        .array(
            z.object({
                serverUrl: z
                    .url({ protocol: /^https?$/ })
                    .max(2048)
                    .refine((value) => {
                        const url = new URL(value);
                        return !url.username && !url.password && !url.search && !url.hash;
                    })
                    .transform(normalizeSyndicationUrl),
                secret: z.string().min(1).max(4096),
            }),
        )
        .min(1)
        .max(16),
});

export const readCheckoutHandoff = (encoded: string | null) => {
    if (!encoded) {
        return { carts: [], error: "" };
    }
    try {
        const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
        const decoded = new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
        const payload = checkoutSchema.parse(JSON.parse(decoded));
        return { carts: payload.carts, error: "" };
    } catch (error) {
        console.error("Invalid checkout handoff", error instanceof Error ? error.name : "Invalid data");
        return { carts: [], error: "This checkout link is invalid. Ask the agent to create a new one." };
    }
};

export const mergeCheckoutCartSecrets = (
    current: CartSecretEntry[] | undefined,
    incoming: CartSecretEntry[],
): CartSecretEntry[] => [...new Map([...(current || []), ...incoming].map((entry) => [entry.url, entry])).values()];
