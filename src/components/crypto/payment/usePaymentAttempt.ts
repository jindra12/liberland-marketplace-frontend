import { useMutation } from "@tanstack/react-query";
import { useSessionStorage } from "usehooks-ts";
import { message } from "antd";
import { Mutex, tryAcquire } from "async-mutex";
import { BACKEND_URL } from "../../../gqlFetcher";
import { PAYMENT_ATTEMPT_STORAGE_KEY } from "../../order/constants";
import { useOrderPaymentLockContext } from "../../order/OrderPaymentLockContext";
import type { PaymentAttempt, PaymentAttemptOptions } from "./types";

const paymentMutex = tryAcquire(new Mutex());

export const usePaymentAttempt = (options: PaymentAttemptOptions) => {
    const key = JSON.stringify([
        options.model.serverUrl || BACKEND_URL,
        options.model.orderId,
        options.chain,
        options.model.recipient,
        options.model.amount.toString(),
    ]);
    const [attempt, setAttempt] = useSessionStorage<PaymentAttempt | undefined>(
        `${PAYMENT_ATTEMPT_STORAGE_KEY}:${key}`,
        undefined,
    );
    const lock = useOrderPaymentLockContext();
    const mutation = useMutation({
        mutationKey: ["PaymentAttempt", key],
        mutationFn: () =>
            paymentMutex.runExclusive(async () => {
                if (lock.isPaymentPending || attempt?.phase === "saved") {
                    return;
                }
                lock.setIsPaymentPending(true);
                try {
                    const hash = attempt?.hash || (await options.send());
                    setAttempt({ hash, phase: "broadcast" });
                    await options.confirm(hash);
                    setAttempt({ hash, phase: "confirmed" });
                    await options.saveProof(hash);
                    setAttempt({ hash, phase: "saved" });
                } finally {
                    lock.setIsPaymentPending(false);
                }
            }),
        onError: (error) => {
            console.error(error);
            message.error(error.message);
        },
    });
    return {
        attempt,
        error: mutation.error,
        pending: mutation.isPending,
        disabled: mutation.isPending || lock.isPaymentPending || attempt?.phase === "saved",
        pay: () => mutation.mutate(),
    };
};
