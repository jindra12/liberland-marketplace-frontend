import { SITE_URL } from "../../../siteUrl";

export const buildDonationLink = (serverUrl: string, companyId: string): string => {
    const url = new URL("/pay", SITE_URL);
    url.searchParams.set("serverUrl", serverUrl);
    url.searchParams.set("companyId", companyId);
    return url.href;
};

export const buildMerchantRequestExample = (
    serverUrl: string,
    companyId: string,
): string => `// Run on your backend, never in your Dart/browser client.
import { createHmac } from "node:crypto";
import stringify from "fast-json-stable-stringify";
const input = {
  companyId: "${companyId}",
  amountUsdCents: 1000,
  externalReference: "donation-123"
};
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac("sha256", process.env.NSWAP_WEBHOOK_SECRET)
  .update(timestamp + "." + stringify(input)).digest("hex");
const response = await fetch("${serverUrl}/api/graphql", {
  method: "POST",
  body: JSON.stringify({
    query: \`mutation CreateHostedCheckoutSession($input: HostedCheckoutInput!) {
      createHostedCheckoutSession(input: $input) { sessionId checkoutUrl }
    }\`,
    variables: { input }
  }),
  headers: { "Content-Type": "application/json",
    "X-Nswap-Timestamp": timestamp, "X-Nswap-Signature": signature }
});
const { data, errors } = await response.json();
if (!response.ok || errors?.length) {
  throw new Error(errors?.[0]?.message || "Checkout creation failed");
}
const { checkoutUrl } = data.createHostedCheckoutSession;
// Return checkoutUrl to your app and open it in the user's browser.`;

export const PAYMENT_NOTIFICATION_EXAMPLE = JSON.stringify(
    {
        version: 1,
        id: "stable-session-id",
        type: "payment.completed",
        createdAt: "2026-01-01T12:00:00.000Z",
        serverUrl: "https://your-marketplace-backend.example",
        sessionId: "stable-session-id",
        companyId: "company-id",
        productId: null,
        kind: "donation",
        quantity: 1,
        externalReference: "donation-123",
        requestedAmountUsdCents: 1000,
        settlement: {
            receiver: "0xYourCompanyWallet",
            chainId: 8453,
            tokenSymbol: "USDC",
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            amount: "10000000",
            decimals: 6,
        },
        verification: {
            provider: "thirdweb",
            verifiedAt: "2026-01-01T12:00:00.000Z",
            signatureVerified: true,
            completed: true,
            receiverMatched: true,
            chainMatched: true,
            tokenMatched: true,
            amountSatisfied: true,
        },
        thirdweb: {
            paymentId: "thirdweb-payment-id",
            rawBody: "Original, unmodified Thirdweb webhook JSON string",
            signatureHeaders: {
                "x-pay-signature": "original-provider-signature",
                "x-pay-timestamp": "original-timestamp",
            },
            transactions: [{ chainId: 8453, transactionHash: "0xDestinationTransactionHash" }],
        },
    },
    null,
    2,
);

export const VERIFY_PAYMENT_EXAMPLE = `// Verify the RAW request body before JSON parsing.
import { createHmac, timingSafeEqual } from "node:crypto";
const timestamp = request.headers.get("x-nswap-timestamp") || "";
const signature = request.headers.get("x-nswap-signature") || "";
const rawBody = await request.text();
if (!/^\\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)
    || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
  throw new Error("Invalid or expired payment notification");
}
const expected = createHmac("sha256", process.env.NSWAP_WEBHOOK_SECRET)
  .update(timestamp + "." + rawBody).digest();
if (!timingSafeEqual(Buffer.from(signature, "hex"), expected)) {
  throw new Error("Invalid payment signature");
}
const event = JSON.parse(rawBody);
// In your database: atomically deduplicate event.id AND apply the credit.
// Use event.externalReference to locate the order or donation.
// Return HTTP 2xx after durably accepting the event.`;
