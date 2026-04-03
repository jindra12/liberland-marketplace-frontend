import type { BrowserContext } from "@playwright/test";

import {
    EVM_WALLET_MOCK,
    SOLANA_RPC_URL,
    SOLANA_WALLET_MOCK,
    TRON_WALLET_MOCK,
} from "./constants";

type InitScriptPayload = {
    evm: typeof EVM_WALLET_MOCK;
    solanaRpcUrl: string;
    solana: typeof SOLANA_WALLET_MOCK;
    tron: typeof TRON_WALLET_MOCK;
};

export const installWalletMocks = async (context: BrowserContext): Promise<void> => {
    const payload: InitScriptPayload = {
        evm: EVM_WALLET_MOCK,
        solanaRpcUrl: SOLANA_RPC_URL,
        solana: SOLANA_WALLET_MOCK,
        tron: TRON_WALLET_MOCK,
    };

    await context.addInitScript((scriptPayload: InitScriptPayload) => {
        const evmState = {
            balances: {
                [scriptPayload.evm.sender.toLowerCase()]: BigInt(scriptPayload.evm.initialSenderBalanceWei),
                [scriptPayload.evm.recipient.toLowerCase()]: BigInt(scriptPayload.evm.initialRecipientBalanceWei),
            },
            counter: 0,
        };

        const toHex = (value: bigint) => `0x${value.toString(16)}`;

        (window as typeof window & { ethereum?: unknown }).ethereum = {
            isMetaMask: true,
            selectedAddress: scriptPayload.evm.sender,
            request: async ({
                method,
                params,
            }: {
                method: string;
                params?: unknown[];
            }) => {
                if (method === "eth_requestAccounts" || method === "eth_accounts") {
                    return [scriptPayload.evm.sender];
                }

                if (method === "eth_chainId") {
                    return scriptPayload.evm.chainId;
                }

                if (method === "eth_getBalance") {
                    const address = String(params?.[0] ?? "").toLowerCase();
                    return toHex(evmState.balances[address] ?? 0n);
                }

                if (method === "eth_sendTransaction") {
                    const transaction = params?.[0];
                    const from = String(transaction?.from ?? scriptPayload.evm.sender).toLowerCase();
                    const to = String(transaction?.to ?? scriptPayload.evm.recipient).toLowerCase();
                    const value = BigInt(String(transaction?.value ?? "0"));

                    evmState.balances[from] = (evmState.balances[from] ?? 0n) - value;
                    evmState.balances[to] = (evmState.balances[to] ?? 0n) + value;
                    evmState.counter += 1;

                    return `0x${evmState.counter.toString(16).padStart(64, "0")}`;
                }

                throw new Error(`Unhandled mock ethereum method: ${method}`);
            },
            on: () => {},
            removeListener: () => {},
        };

        const createPublicKey = (address: string) => ({
            toBase58: () => address,
            toString: () => address,
        });

        const toUint8Array = (value: unknown): Uint8Array => {
            if (value instanceof Uint8Array) {
                return value;
            }

            if (Array.isArray(value)) {
                return Uint8Array.from(value);
            }

            if (typeof value === "object" && value && "data" in value && Array.isArray(value.data)) {
                return Uint8Array.from(value.data);
            }

            return new Uint8Array();
        };

        const getInstructionAddress = (value: unknown): string => {
            if (typeof value === "string") {
                return value;
            }

            if (typeof value === "object" && value && "toBase58" in value && typeof value.toBase58 === "function") {
                return value.toBase58();
            }

            return "";
        };

        const applySolanaTransfer = async (transaction: {
            instructions?: Array<{
                data?: unknown;
                keys?: Array<{ pubkey?: unknown }>;
            }>;
        }) => {
            const instruction = transaction.instructions?.find((candidate) => candidate.keys?.length === 2);
            if (!instruction?.keys) {
                throw new Error("Mock Solana wallet could not find a transfer instruction");
            }

            const data = toUint8Array(instruction.data);
            if (data.byteLength < 12) {
                throw new Error("Mock Solana wallet received invalid transfer instruction data");
            }

            const lamports = Number(new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(4, true));
            const from = getInstructionAddress(instruction.keys[0]?.pubkey);
            const to = getInstructionAddress(instruction.keys[1]?.pubkey);
            const response = await fetch(scriptPayload.solanaRpcUrl, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: Date.now(),
                    method: "mockApplySystemTransfer",
                    params: [
                        {
                            from,
                            to,
                            lamports,
                        },
                    ],
                }),
            });
            const json = (await response.json()) as { result?: string; error?: { message?: string } };
            if (json.error?.message) {
                throw new Error(json.error.message);
            }
            return json.result ?? "";
        };

        const solanaProvider = {
            isSolflare: true,
            isPhantom: false,
            publicKey: createPublicKey(scriptPayload.solana.sender),
            connect: async () => ({
                publicKey: createPublicKey(scriptPayload.solana.sender),
            }),
            disconnect: async () => {},
            on: () => {},
            off: () => {},
            sendTransaction: async (transaction: {
                instructions?: Array<{
                    data?: unknown;
                    keys?: Array<{ pubkey?: unknown }>;
                }>;
            }) => {
                return applySolanaTransfer(transaction);
            },
        };

        (window as typeof window & { solana?: unknown }).solana = solanaProvider;
        (window as typeof window & { solflare?: unknown }).solflare = solanaProvider;
        (window as typeof window & { phantom?: { solana?: unknown } }).phantom = {
            solana: {
                ...solanaProvider,
                isSolflare: false,
                isPhantom: true,
            },
        };

        const signTransaction = async (transaction: Record<string, unknown>) => {
            return {
                ...transaction,
                signature: [`playwright-tron-signature-${Date.now()}`],
            };
        };

        (window as typeof window & { tronLink?: unknown }).tronLink = {
            ready: true,
            request: async ({ method }: { method: string }) => {
                if (method === "tron_requestAccounts") {
                    return {
                        code: 200,
                        message: "ok",
                        address: scriptPayload.tron.sender,
                    };
                }

                throw new Error(`Unhandled mock tronLink method: ${method}`);
            },
            tronWeb: {
                defaultAddress: {
                    base58: scriptPayload.tron.sender,
                    hex: scriptPayload.tron.senderHex,
                },
                trx: {
                    sign: signTransaction,
                },
            },
        };

        (window as typeof window & { tronWeb?: unknown }).tronWeb = {
            ready: true,
            defaultAddress: {
                base58: scriptPayload.tron.sender,
                hex: scriptPayload.tron.senderHex,
            },
            trx: {
                sign: signTransaction,
            },
        };
    }, payload);
};
