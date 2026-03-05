import { Connection, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useMutation } from "@tanstack/react-query";
import { toUnits } from "thirdweb";
import settings from "../settings.json";
import { FormModel } from "./types";
import { decimals } from "./constants";

const connection = new Connection(settings.helius, "confirmed");

const createTestTransaction = async ({
    recipient,
    sender,
    token,
    amount,
}: {
    sender: PublicKey,
    recipient: PublicKey,
    token: PublicKey,
    amount: bigint,
}) => {
    const instructions: TransactionInstruction[] = [];
    const senderAssociatedToken = await getAssociatedTokenAddress(
        token,
        sender,
        false,
        TOKEN_PROGRAM_ID
    );
    const receiverAssociatedToken = await getAssociatedTokenAddress(
        token,
        recipient,
    );
    try {
        await getAccount(connection, receiverAssociatedToken);
    } catch { // Account does not exist
        const create = createAssociatedTokenAccountInstruction(
            sender,
            receiverAssociatedToken,
            recipient,
            token,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );
        instructions.push(create);
    }

    instructions.push(createTransferInstruction(
        senderAssociatedToken,
        receiverAssociatedToken,
        sender,
        amount,
        [],
        TOKEN_PROGRAM_ID,
    ));

    const { blockhash } = await connection.getLatestBlockhash();
    const messageV0 = new TransactionMessage({
        payerKey: sender,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message(); 

    return new VersionedTransaction(messageV0);
}

const evaluateTransactionCost = async (transaction: VersionedTransaction) => {
    const fee = await connection.getFeeForMessage(transaction.message, "confirmed");
    const { value } = await connection.simulateTransaction(transaction, {
        sigVerify: false,
        commitment: "processed",
        accounts: {
            encoding: "base64",
            addresses: [settings.seller.sol],
        }
    });
    if (value.err) {
        throw value;
    }
    const prioritizationFees = await connection.getRecentPrioritizationFees();
    const computeUnitPrice = prioritizationFees[0]?.prioritizationFee || 0;
    const baseFee = 5000;
    const estimatedFeeLamports = ((value.unitsConsumed || 0) * computeUnitPrice) + baseFee;
    return BigInt((fee.value || 0) + estimatedFeeLamports);
}


export const useSolanaVerifier = () => {
    const publicKey = new PublicKey(settings.seller.sol);
    return useMutation({
        mutationKey: ["solana-balances"],
        mutationFn: async (formModel: FormModel) => {
            const lamports = await connection.getBalance(publicKey);
            const sol = BigInt(lamports);
            const mintPub = new PublicKey(formModel.token === "LLD" ? settings.lld.sol : settings.usdt.sol);
            const transCost = await evaluateTransactionCost(
                await createTestTransaction({
                    amount: toUnits(formModel.toAmount, decimals.Solana[formModel.token]),
                    recipient: new PublicKey(formModel.recipient),
                    sender: new PublicKey(settings.seller.sol),
                    token: mintPub,
                })
            );
            return sol > 2n * transCost;
        },
    })
};