import type { Connection, PublicKey } from "./solana-web3";

type CreateTransferParams = {
    recipient: PublicKey;
    amount: {
        toString: () => string;
    };
    reference: PublicKey;
    memo: string;
};

export const createTransfer = async (
    _connection: Connection,
    _sender: PublicKey,
    _params: CreateTransferParams,
): Promise<Record<string, string>> => {
    return {
        type: "solana-transfer-stub",
    };
};

