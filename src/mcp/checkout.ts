import { getSiteUrl } from "../siteUrl";

export type CheckoutCartReference = { serverUrl: string; secret: string };

export type CheckoutCartSnapshot = CheckoutCartReference & {
    cart: {
        items?: Array<{
            quantity?: number | null;
            product?: {
                id?: string | null;
                name?: string | null;
                priceInUSD?: number | string | null;
                priceInETH?: number | string | null;
                priceInSOL?: number | string | null;
                priceInTRX?: number | string | null;
                cryptoAddresses?: Array<{ chain?: string | null; address?: string | null }> | null;
            } | null;
        }> | null;
    };
};

export const createCheckoutLink = (carts: CheckoutCartReference[]): string => {
    const payload = Buffer.from(JSON.stringify({ carts }), "utf8").toString("base64url");
    return `${getSiteUrl()}/order?mcpCheckout=${encodeURIComponent(payload)}`;
};

export const buildCheckoutPaymentSummary = (carts: CheckoutCartSnapshot[]) => {
    const items = carts.flatMap((entry) => (entry.cart.items ?? []).map((item) => ({
        serverUrl: entry.serverUrl,
        productId: item.product?.id ?? null,
        productName: item.product?.name ?? null,
        quantity: item.quantity ?? 0,
        prices: {
            USD: item.product?.priceInUSD ?? null,
            ETH: item.product?.priceInETH ?? null,
            SOL: item.product?.priceInSOL ?? null,
            TRX: item.product?.priceInTRX ?? null,
        },
        paymentWallets: item.product?.cryptoAddresses ?? [],
    })));
    const chainRequirements = Array.from(new Set(items.flatMap((item) => item.paymentWallets.map((wallet) => wallet.chain).filter(Boolean)))).map((chain) => ({
        chain,
        paymentWallets: items.flatMap((item) => item.paymentWallets.filter((wallet) => wallet.chain === chain)),
    }));

    return { backendCount: carts.length, items, chainRequirements };
};
