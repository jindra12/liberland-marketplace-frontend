import http from "node:http";

import type { WalletMocksConfig } from "./types";
import { loadJson, parseCliArgs, readJsonBody, sendJson } from "./utils";

const args = parseCliArgs(process.argv.slice(2));
const port = Number(args.port);
const config = loadJson<WalletMocksConfig>(new URL("../../../wallet-mocks.json", import.meta.url));
const tronConfig = config.wallets.tron;

const initialBalances = new Map([
    [tronConfig.senderHex, tronConfig.initialSenderSun],
    [tronConfig.recipientHex, tronConfig.initialRecipientSun],
]);
const balances = new Map(initialBalances);

const blockTimestamp = Date.now();
const block = {
    blockID: "0000000000000000abcdef1234567890abcdef1234567890abcdef1234567890",
    block_header: {
        raw_data: {
            number: 1,
            timestamp: blockTimestamp,
        },
    },
};

type TronTransactionRequest = {
    address?: string;
    raw_data?: {
        contract?: Array<{
            parameter?: {
                value?: {
                    amount?: number | string | null;
                    owner_address?: string;
                    to_address?: string;
                };
            };
        }>;
    };
    txID?: string;
    value?: string;
};

type TronSignedTransaction = TronTransactionRequest;

const toTransactionInfo = (txID: string | undefined) => ({
    id: txID,
    receipt: {
        result: "SUCCESS",
    },
});

const transactions = new Map<string, TronSignedTransaction>();

const resetState = () => {
    balances.clear();
    initialBalances.forEach((value, key) => {
        balances.set(key, value);
    });
    transactions.clear();
};

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "GET" && request.url === "/healthz") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "GET" && request.url === "/__state") {
        sendJson(response, 200, {
            sender: balances.get(tronConfig.senderHex),
            recipient: balances.get(tronConfig.recipientHex),
        });
        return;
    }

    if (request.method === "POST" && request.url === "/__admin/reset") {
        resetState();
        sendJson(response, 200, {
            ok: true,
        });
        return;
    }

    if (request.method !== "POST") {
        sendJson(response, 404, { error: "Not found" });
        return;
    }

    const body = await readJsonBody<TronTransactionRequest>(request);

    if (request.url === "/wallet/getblock") {
        sendJson(response, 200, block);
        return;
    }

    if (request.url === "/wallet/getaccount" || request.url === "/walletsolidity/getaccount") {
        sendJson(response, 200, {
            address: body.address,
            balance: balances.get(body.address ?? "") ?? 0,
        });
        return;
    }

    if (request.url === "/wallet/broadcasttransaction") {
        const signedTransaction = body as TronSignedTransaction;
        const value = signedTransaction.raw_data?.contract?.[0]?.parameter?.value;
        const from = value?.owner_address ?? "";
        const to = value?.to_address ?? "";
        const amount = Number(value?.amount ?? 0);
        const fromBalance = balances.get(from) ?? 0;

        if (fromBalance < amount) {
            sendJson(response, 200, {
                result: false,
                txid: signedTransaction.txID ?? "",
                code: "CONTRACT_VALIDATE_ERROR",
                message: "insufficient funds",
            });
            return;
        }

        balances.set(from, fromBalance - amount);
        balances.set(to, (balances.get(to) ?? 0) + amount);
        transactions.set(signedTransaction.txID ?? "", signedTransaction);

        sendJson(response, 200, {
            result: true,
            txid: signedTransaction.txID ?? "",
        });
        return;
    }

    if (request.url === "/wallet/gettransactionbyid" || request.url === "/walletsolidity/gettransactionbyid") {
        sendJson(response, 200, transactions.get(body.value ?? "") ?? {});
        return;
    }

    if (request.url === "/wallet/gettransactioninfobyid" || request.url === "/walletsolidity/gettransactioninfobyid") {
        sendJson(response, 200, toTransactionInfo(body.value));
        return;
    }

    sendJson(response, 404, { error: `Unsupported Tron RPC path: ${request.url}` });
});

server.listen(port, "127.0.0.1");
