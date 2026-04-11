export const clusterApiUrl = (_network: string): string => {
    return "http://127.0.0.1:8899";
};

export class PublicKey {
    private readonly value: string;

    public constructor(input: string | Uint8Array) {
        this.value = typeof input === "string" ? input : `SoStub-${input.length}`;
    }

    public toBase58(): string {
        return this.value;
    }
}

export class Connection {
    public async getLatestBlockhash(): Promise<{
        blockhash: string;
        lastValidBlockHeight: number;
    }> {
        return {
            blockhash: "solana-blockhash-stub",
            lastValidBlockHeight: 12345,
        };
    }

    public async confirmTransaction(
        _transaction: {
            blockhash: string;
            lastValidBlockHeight: number;
            signature: string;
        },
        _commitment?: string,
    ): Promise<void> {
        return;
    }
}
