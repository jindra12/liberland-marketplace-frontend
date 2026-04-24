import type { ComponentProps, ReactNode } from "react";
import type { OidcStandardClaims } from "oidc-client-ts";
import type { Space, Tag } from "antd";
import type {
    CartBySecretQuery,
    Company,
    CreateOrderMutation,
    Identity,
    Job,
    ListProductsByCompanyQuery,
    ListProductsByIdentityQuery,
    ListProductsQuery,
    ProductByIdQuery,
    Product,
    Startup,
} from "./generated/graphql";

export type URL = {
    enabled: boolean;
    value: string;
    name: string | null;
    description?: string | null;
};

export type SyndicationDoc = {
    url?: string | null;
    name?: string | null;
    description?: string | null;
};

export type SearchScope = "jobs" | "companies" | "identities" | "products" | "startups" | "posts";
export type SearchOption = { key: string; value: string; id: string; label?: ReactNode; image?: string | null };
export type DocType = Partial<Identity | Company | Job | Product | Startup>;
export type ImageDoc = {
    __typename?: "Company" | "Identity" | "Job" | "Product" | "Startup";
    image?: { url?: string | null } | null;
    serverURL?: string | null;
} | null;

type ListProductsDoc = NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number];
type ListProductsByCompanyDoc = NonNullable<NonNullable<ListProductsByCompanyQuery["Products"]>["docs"]>[number];
type ListProductsByIdentityDoc = NonNullable<NonNullable<ListProductsByIdentityQuery["Products"]>["docs"]>[number];
type ProductByIdDoc = NonNullable<ProductByIdQuery["Product"]>;
type CartBySecretDoc = NonNullable<NonNullable<CartBySecretQuery["Carts"]>["docs"]>[number];

export type PurchasableProduct =
    | ListProductsDoc
    | ListProductsByCompanyDoc
    | ListProductsByIdentityDoc
    | ProductByIdDoc;

export type CartForRequiredChains = Pick<CartBySecretDoc, "items">;
export type OrderForPayments = NonNullable<CreateOrderMutation["createOrder"]>;

export type CryptoChain = "ethereum" | "solana" | "tron";

export type ChainPrice = {
    chain: CryptoChain;
    expectedNativeAmount?: number | null;
    nativePerStable?: number | null;
    stablePerNative?: number | null;
    fetchedAt?: unknown;
};

export type CryptoWalletOwner =
    | Pick<PurchasableProduct, "cryptoAddresses">
    | NonNullable<PurchasableProduct["company"]>;

export type IdentityTagItem = {
    id: string;
    name: string;
};

export type IdentityTagLinkProps = {
    identity: IdentityTagItem;
    color?: ComponentProps<typeof Tag>["color"];
    icon?: ReactNode;
};

export type EntitySubListSectionProps = {
    title: string;
    children: ReactNode;
};

export type IdentityGroupsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    emptyText?: ReactNode;
};

export type CompanyContactLinksProps = {
    identity?: IdentityTagItem;
    website?: string | null;
    email?: unknown;
    phone?: string | null;
    className?: string;
};

export type IdentityAccessTagsProps = {
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    className?: string;
    showIcons?: boolean;
    hideWhenEmpty?: boolean;
    keyPrefix?: string;
};

export type JobMetaTagsProps = {
    showCompany?: boolean;
    companyName?: string | null;
    companyIdentity?: IdentityTagItem;
    positions?: string | null;
    bounty?: string | null;
    isInactive?: boolean;
    className?: string;
};

export type JobDetailsSummaryProps = {
    companyName?: string | null;
    location?: string | null;
    employmentType?: string | null;
    salary?: string | null;
    bounty?: string | null;
    positions?: string | null;
    postedAt?: string | null;
    isInactive?: boolean;
    showCompanyIcon?: boolean;
    metaSize?: ComponentProps<typeof Space>["size"];
};

export type AuthProfile = OidcStandardClaims;

export type JobDerivedInput = {
    bounty?: {
        amount?: number | null;
        currency?: string | null;
    } | null;
    positions?: number | null;
    allowedIdentities?: IdentityTagItem[] | null;
    disallowedIdentities?: IdentityTagItem[] | null;
    company?: {
        identity?: IdentityTagItem | null;
        allowedIdentities?: IdentityTagItem[] | null;
        disallowedIdentities?: IdentityTagItem[] | null;
    } | null;
};

export type JobIdentityDedupeBy = "id" | "name";

export interface ConnectButtonProps {
    selectWallet: (wallet: string) => void;
}

export type Chains = "Ethereum" | "Solana" | "Tron";

export interface FormModel {
    amount: bigint;
    orderId: string;
    recipient: string;
    transactionHash?: string;
}
