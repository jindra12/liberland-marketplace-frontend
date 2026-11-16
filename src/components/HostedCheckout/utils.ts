import { z } from "zod";
import { getAddress, isAddress } from "thirdweb/utils";
import {
    HostedCheckoutSessionDocument,
    CreateHostedCheckoutSessionDocument,
    type HostedCheckoutSessionQuery,
    type HostedCheckoutSessionQueryVariables,
    type CreateHostedCheckoutSessionMutation,
    type CreateHostedCheckoutSessionMutationVariables,
} from "../../generated/graphql";
import { publicGqlFetcher } from "../../publicGqlFetcher";

const paymentAddressSchema = z.string().refine(isAddress, "Invalid payment address.").transform(getAddress);

const checkoutReturnUrlSchema = z
    .url({ protocol: /^https?$/ })
    .transform((value) => new URL(value))
    .refine(
        (url) =>
            !url.username &&
            !url.password &&
            (url.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)),
        "Return links must use HTTPS, or a local development origin, without credentials.",
    )
    .transform((url) => url.href);

export const hostedSessionSchema = z.object({
    sessionId: z.uuid(),
    title: z.string(),
    status: z.enum(["pending", "paid"]),
    paymentRecorded: z.boolean().optional(),
    expiresAt: z.string(),
    amountUsdCents: z.number().int().positive(),
    receiver: paymentAddressSchema,
    thirdwebClientId: z.string().min(1),
    returnUrl: checkoutReturnUrlSchema.nullable().optional(),
    settlement: z.object({
        chainId: z.number().int(),
        tokenAddress: paymentAddressSchema,
        decimals: z.number().int(),
        symbol: z.string(),
    }),
    purchaseData: z.object({ nswapSessionId: z.uuid() }),
});

export const checkoutServerSchema = z.url({ protocol: /^https?$/ }).pipe(
    z.string().refine((value) => {
        const url = new URL(value);
        return !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash;
    }, "Select a marketplace backend origin without credentials or extra paths."),
);

export const getHostedSession = async (serverUrl: string, sessionId: string) => {
    const result = await publicGqlFetcher<HostedCheckoutSessionQuery, HostedCheckoutSessionQueryVariables>(
        HostedCheckoutSessionDocument,
        { sessionId },
        serverUrl,
    );
    return hostedSessionSchema.parse(result.hostedCheckoutSession);
};

export const createHostedSession = async (
    serverUrl: string,
    companyId: string,
    productId: string | null,
    quantity: number,
    amountUsdCents?: number,
) => {
    const result = await publicGqlFetcher<
        CreateHostedCheckoutSessionMutation,
        CreateHostedCheckoutSessionMutationVariables
    >(
        CreateHostedCheckoutSessionDocument,
        { input: { companyId, ...(productId ? { productId, quantity } : { amountUsdCents }) } },
        serverUrl,
    );
    return hostedSessionSchema.parse(result.createHostedCheckoutSession);
};
