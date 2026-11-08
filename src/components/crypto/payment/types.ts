import type { CryptoChain, FormModel } from "../../../types";

export type PaymentAttempt = {
    hash: string;
    phase: "broadcast" | "confirmed" | "saved";
};

export type PaymentAttemptOptions = {
    chain: CryptoChain;
    model: FormModel;
    send: () => Promise<string>;
    confirm: (hash: string) => Promise<void>;
    saveProof: (hash: string) => Promise<void>;
};
