import { PublicKey } from "@solana/web3.js";

export const getSolanaOrderReference = async (orderId: string): Promise<PublicKey> => {
    const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(orderId));
    return new PublicKey(new Uint8Array(digest));
};
