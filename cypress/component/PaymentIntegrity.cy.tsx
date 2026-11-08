import {
    Order_CryptoPrices_Chain,
    Order_PaymentProofs_Chain,
    Order_PaymentTargets_Chain,
    OrderUpdate_PaymentProofs_Chain_MutationInput,
    Product_CryptoAddresses_Chain,
} from "../../src/generated/graphql";
import type { OrderForPayments } from "../../src/types";
import {
    collectOrderChainPaymentAmounts,
    toExistingTransactionHashRows,
    appendTransactionHashRows,
} from "../../src/components/order/payment/utils";

describe("Payment and stored credential integrity", { retries: 0 }, () => {
    it("uses the locked order amount rather than a freshly returned product price", () => {
        const order: OrderForPayments = {
            id: "order",
            cryptoPrices: [
                { chain: Order_CryptoPrices_Chain.Ethereum, expectedNativeAmount: "0.02", nativePerStable: "0.002" },
            ],
            items: [
                {
                    quantity: 1,
                    product: {
                        id: "product",
                        priceInETH: "0.001",
                        cryptoAddresses: {
                            chain: Product_CryptoAddresses_Chain.Ethereum,
                            address: "0x1111111111111111111111111111111111111111",
                        },
                    },
                },
            ],
        };
        expect(collectOrderChainPaymentAmounts(order)[0].amount).to.equal("0.02");
    });

    it("groups saved recipient amounts before rounding and ignores changed product prices and wallets", () => {
        const recipient = "0x1111111111111111111111111111111111111111";
        const secondRecipient = "0x2222222222222222222222222222222222222222";
        const order: OrderForPayments = {
            id: "saved-order",
            cryptoPrices: [{ chain: Order_CryptoPrices_Chain.Ethereum, nativePerStable: "0.000320126001594301" }],
            paymentTargets: [
                {
                    chain: Order_PaymentTargets_Chain.Ethereum,
                    productID: "a",
                    recipientAddress: recipient,
                    normalizedRecipientAddress: recipient,
                    stableAmount: 19.99,
                },
                {
                    chain: Order_PaymentTargets_Chain.Ethereum,
                    productID: "b",
                    recipientAddress: recipient,
                    normalizedRecipientAddress: recipient,
                    stableAmount: 39.98,
                },
                {
                    chain: Order_PaymentTargets_Chain.Ethereum,
                    productID: "c",
                    recipientAddress: secondRecipient,
                    normalizedRecipientAddress: secondRecipient,
                    stableAmount: 100,
                },
            ],
            items: [
                {
                    quantity: 999,
                    product: {
                        id: "a",
                        priceInETH: "9000",
                        cryptoAddresses: {
                            chain: Product_CryptoAddresses_Chain.Ethereum,
                            address: secondRecipient,
                        },
                    },
                },
            ],
        };
        const payments = collectOrderChainPaymentAmounts(order);
        expect(payments).to.deep.equal([
            {
                chain: "ethereum",
                recipient,
                productIds: ["a", "b"],
                amount: "0.01919795631561023",
                amountInSmallestUnit: 19197956315610230n,
            },
            {
                chain: "ethereum",
                recipient: secondRecipient,
                productIds: ["c"],
                amount: "0.0320126001594301",
                amountInSmallestUnit: 32012600159430100n,
            },
        ]);
        expect(collectOrderChainPaymentAmounts({ ...order, cryptoPrices: [] })).to.deep.equal([]);
    });

    it("retains previously saved proofs through a second payment and a re-cased retry", () => {
        const order = {
            paymentProofs: [
                {
                    id: "first-proof",
                    product: { id: "product" },
                    chain: Order_PaymentProofs_Chain.Ethereum,
                    transactionHash: "0xabc",
                    fulfilled: true,
                    rejected: false,
                },
            ],
        };
        const result = appendTransactionHashRows({
            existingRows: toExistingTransactionHashRows(order),
            productIds: ["product", "second-product"],
            chain: "ethereum",
            txHash: "0xABC",
        });
        expect(result.appendedCount).to.equal(1);
        expect(result.nextRows).to.deep.equal([
            {
                id: "first-proof",
                product: "product",
                chain: OrderUpdate_PaymentProofs_Chain_MutationInput.Ethereum,
                transactionHash: "0xabc",
                fulfilled: true,
                rejected: false,
            },
            {
                product: "second-product",
                chain: OrderUpdate_PaymentProofs_Chain_MutationInput.Ethereum,
                transactionHash: "0xABC",
            },
        ]);
        expect(
            appendTransactionHashRows({
                ...result,
                existingRows: result.nextRows,
                productIds: ["product", "second-product"],
                chain: "ethereum",
                txHash: "0xabc",
            }).appendedCount,
        ).to.equal(0);
    });
});
