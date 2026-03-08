import { ResultStatusType } from "antd/es/result";
import Autolinker from "autolinker";
import { FetchStatus, QueryObserverResult, QueryStatus, RefetchOptions, UseQueryResult } from "@tanstack/react-query";
import mergeWith from "lodash-es/mergeWith";
import maxBy from "lodash-es/maxBy";
import {
    AuthProfile,
    CartForRequiredChains,
    ChainPrice,
    CommentCurrentUser,
    CommentDataItem,
    CommentDoc,
    CommentGrouping,
    CommentSectionStyles,
    CommentThemeVars,
    CryptoChain,
    CryptoWalletOwner,
    EntityCommentsThemeToken,
    ImageDoc,
    OrderForPayments,
    PurchasableProduct,
} from "./types";
import { Job_EmploymentType } from "./generated/graphql";
import { isCryptoCurrency } from "./components/publish/constants";
import {
    ENTITY_COMMENTS_ANONYMOUS_NAME,
    ENTITY_COMMENTS_ANONYMOUS_USER_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
    ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
    ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
    ENTITY_COMMENTS_USER_FALLBACK_NAME,
} from "./constants";

export const convertStatusCode = (status?: number): ResultStatusType => {
    if (status === 403 || status === 404 || status === 500) {
        return status;
    }
    return "error";
};

export const getErrorMessage = (status?: number) => {
    switch (status) {
        case 403: return "Forbidden";
        case 404: return "Not Found";
        default: return "Try later";
    }
};

export const timeAgo = (date: string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, "year"],
        [2592000, "month"],
        [604800, "week"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ];
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
};

const getCryptoFractionDigits = (currency: string, fallback: number): number =>
    isCryptoCurrency(currency) ? 6 : fallback;

export const formatSalary = (min?: number | null, max?: number | null, currency?: string | null): string | null => {
    if (min == null && max == null) return null;
    const cur = currency || "USD";
    const digits = getCryptoFractionDigits(cur, 0);
    const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: digits });
    if (min != null && max != null) return `${cur} ${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `From ${cur} ${fmt(min)}`;
    return `Up to ${cur} ${fmt(max!)}`;
};

export const formatBounty = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const cur = currency || "USD";
    const fallback = Number.isInteger(amount) ? 0 : 2;
    const maxFractionDigits = getCryptoFractionDigits(cur, fallback);
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${cur} ${fmt}`;
};

export const formatPrice = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const cur = currency || "USD";
    const fallback = Number.isInteger(amount) ? 0 : 2;
    const maxFractionDigits = getCryptoFractionDigits(cur, fallback);
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${cur} ${fmt}`;
};

export const fromCents = (amount?: number | null): number | null => {
    if (amount == null) {
        return null;
    }
    return amount / 100;
};

export const toCents = (amount?: number | null): number | null => {
    if (amount == null) {
        return null;
    }
    return Math.round(amount * 100);
};

export const formatPriceFromCents = (amount?: number | null, currency?: string | null): string | null => {
    return formatPrice(fromCents(amount), currency);
};

export const formatPositions = (positions?: number | null): string | null => {
    if (!positions || positions === 1) return null;
    const maxFractionDigits = Number.isInteger(positions) ? 0 : 2;
    const value = positions.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${value} position${positions === 1 ? "" : "s"}`;
};

export const CRYPTO_CHAIN_LABELS: Record<CryptoChain, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
    tron: "Tron",
};

export const CRYPTO_CHAIN_TICKERS: Record<CryptoChain, string> = {
    ethereum: "ETH",
    solana: "SOL",
    tron: "TRX",
};
const toFiniteNumber = (value?: string | number | null) => {
    if (value === null || value === undefined) {
        return undefined;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

export const hasCryptoWallet = (entity?: CryptoWalletOwner | null) => {
    const address = entity?.cryptoAddresses?.address;
    return typeof address === "string" && address.trim().length > 0;
};

export const isProductPurchasable = (product?: PurchasableProduct | null) => {
    if (!product || product.orderable !== true) {
        return false;
    }

    return hasCryptoWallet(product) || hasCryptoWallet(product.company);
};

export const inferNameParts = (fullName?: string) => {
    if (!fullName) {
        return {
            firstName: undefined,
            lastName: undefined,
        };
    }

    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ");
    return {
        firstName,
        lastName: lastName.length > 0 ? lastName : undefined,
    };
};

export const toCryptoChain = (value: unknown): CryptoChain | undefined => {
    const chain = typeof value === "string" ? value.toLowerCase() : "";
    switch (chain) {
        case "ethereum":
        case "solana":
        case "tron":
            return chain;
        default:
            return undefined;
    }
};

export const formatNativeCryptoAmount = (amount?: string | number | null) => {
    const parsed = toFiniteNumber(amount);
    if (parsed === undefined) {
        return "N/A";
    }
    return parsed.toLocaleString("en-US", { maximumFractionDigits: 8 });
};

export const collectOrderChainPrices = (order: Pick<OrderForPayments, "cryptoPrices">): ChainPrice[] => {
    const fromArray = (order.cryptoPrices || []).reduce<Partial<Record<CryptoChain, ChainPrice>>>((result, price) => {
        const chain = toCryptoChain(price?.chain);
        if (!chain) {
            return result;
        }

        result[chain] = {
            chain,
            expectedNativeAmount: toFiniteNumber(price?.expectedNativeAmount),
            nativePerStable: toFiniteNumber(price?.nativePerStable),
            stablePerNative: toFiniteNumber(price?.stablePerNative),
            fetchedAt: price?.fetchedAt,
        };
        return result;
    }, {});

    const chainOrder: CryptoChain[] = ["ethereum", "solana", "tron"];
    return chainOrder
        .map((chain) => fromArray[chain])
        .filter((entry): entry is ChainPrice => Boolean(entry))
        .filter((entry) => typeof entry.expectedNativeAmount === "number" && entry.expectedNativeAmount > 0);
};

export const resolveOrderRecipientAddress = (order: Pick<OrderForPayments, "items">, chain: CryptoChain) => {
    return (order.items || []).reduce<string | undefined>((resolved, item) => {
        if (resolved) {
            return resolved;
        }

        const productChain = toCryptoChain(item?.product?.cryptoAddresses?.chain);
        const productAddressRaw = item?.product?.cryptoAddresses?.address;
        const productAddress = typeof productAddressRaw === "string" ? productAddressRaw.trim() : "";
        if (productChain === chain && productAddress) {
            return productAddress;
        }

        const companyChain = toCryptoChain(item?.product?.company?.cryptoAddresses?.chain);
        const companyAddressRaw = item?.product?.company?.cryptoAddresses?.address;
        const companyAddress = typeof companyAddressRaw === "string" ? companyAddressRaw.trim() : "";
        if (companyChain === chain && companyAddress) {
            return companyAddress;
        }

        return undefined;
    }, undefined);
};

export const collectRequiredChainsForCarts = (carts: CartForRequiredChains[]): CryptoChain[] => {
    const chains = carts.reduce<Set<CryptoChain>>((acc, cart) => {
        return (cart.items || []).reduce<Set<CryptoChain>>((innerAcc, item) => {
            const productChain = toCryptoChain(item?.product?.cryptoAddresses?.chain);
            if (productChain) {
                innerAcc.add(productChain);
            }

            const companyChain = toCryptoChain(item?.product?.company?.cryptoAddresses?.chain);
            if (companyChain) {
                innerAcc.add(companyChain);
            }

            return innerAcc;
        }, acc);
    }, new Set<CryptoChain>());

    return Array.from(chains.values());
};

export const buildOrderEntryKey = (url: string, orderId: string) => `${url}::${orderId}`;

const employmentTypeLabels: Record<Job_EmploymentType, string> = {
    [Job_EmploymentType.FullTime]: "Full-time",
    [Job_EmploymentType.PartTime]: "Part-time",
    [Job_EmploymentType.Contract]: "Contract",
    [Job_EmploymentType.Internship]: "Internship",
    [Job_EmploymentType.Gig]: "Gig",
};

export const formatEmploymentType = (type?: Job_EmploymentType | null): string | null => {
    return type ? employmentTypeLabels[type] ?? null : null;
};

export const parseActionLink = (value?: string | null) => {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return undefined;

    const [match] = Autolinker.parse(text, {
        mention: false,
        hashtag: false,
    });
    if (!match) return undefined;

    return match.getAnchorHref();
};

export const getImage = (doc?: ImageDoc) => {
    if (!doc?.image?.url || !doc?.serverURL) {
        return "";
    }
    try {
        return new URL(doc.image.url!, doc.serverURL!).toString();
    } catch {
        return "";
    }
};

export const getCommentTimestamp = (comment: CommentDoc): string | undefined => {
    const value = comment.updatedAt ?? comment.createdAt;
    return value ? String(value) : undefined;
};

export const toCommentItem = (comment: CommentDoc): CommentDataItem => {
    if (comment.createdBy) {
        const fullName = comment.createdBy.name || comment.createdBy.email || ENTITY_COMMENTS_USER_FALLBACK_NAME;
        return {
            userId: `user:${comment.createdBy.email || comment.createdBy.id}`,
            comId: comment.id,
            fullName,
            avatarUrl: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            userProfile: "",
            text: comment.content,
            timestamp: getCommentTimestamp(comment),
            replies: [],
        };
    }

    return {
        userId: `anon:${comment.anonymousHash || comment.id}`,
        comId: comment.id,
        fullName: ENTITY_COMMENTS_ANONYMOUS_NAME,
        avatarUrl: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
        userProfile: "",
        text: comment.content,
        timestamp: getCommentTimestamp(comment),
        replies: [],
    };
};

export const buildCommentData = (docs: CommentDoc[]): CommentDataItem[] => {
    const { roots, repliesByParent } = docs.reduce<CommentGrouping>((acc, comment) => {
        const parentId = comment.replyComment?.id;
        if (!parentId) {
            acc.roots.push(comment);
            return acc;
        }

        const existingReplies = acc.repliesByParent.get(parentId) || [];
        existingReplies.push(toCommentItem(comment));
        acc.repliesByParent.set(parentId, existingReplies);
        return acc;
    }, {
        roots: [],
        repliesByParent: new Map<string, CommentDataItem[]>(),
    });

    return roots.map((comment) => {
        const root = toCommentItem(comment);
        return {
            ...root,
            replies: repliesByParent.get(comment.id) || [],
        };
    });
};

export const getCommentCurrentUser = (
    isAuthenticated: boolean,
    profile?: AuthProfile
): CommentCurrentUser => {
    if (isAuthenticated) {
        const email = profile?.email;
        const name = profile?.name;
        const picture = profile?.picture;
        const sub = profile?.sub;
        const profileLink = profile?.profile || "";

        return {
            currentUserId: email || sub || ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID,
            currentUserImg: picture || ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
            currentUserProfile: profileLink,
            currentUserFullName: name || email || ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME,
        };
    }

    return {
        currentUserId: ENTITY_COMMENTS_ANONYMOUS_USER_ID,
        currentUserImg: ENTITY_COMMENTS_DEFAULT_AVATAR_URL,
        currentUserProfile: "",
        currentUserFullName: ENTITY_COMMENTS_ANONYMOUS_NAME,
    };
};

export const getCommentThemeVars = (token: EntityCommentsThemeToken): CommentThemeVars => ({
    "--ecs-bg-overlay": token.colorBgContainer,
    "--ecs-bg-form": token.colorFillAlter,
    "--ecs-bg-elevated": token.colorBgElevated,
    "--ecs-text-primary": token.colorText,
    "--ecs-text-secondary": token.colorTextSecondary,
    "--ecs-text-placeholder": token.colorTextPlaceholder,
    "--ecs-border": token.colorBorder,
    "--ecs-border-secondary": token.colorBorderSecondary,
    "--ecs-primary": token.colorPrimary,
    "--ecs-primary-hover": token.colorPrimaryHover,
    "--ecs-font-family": token.fontFamily,
    "--ecs-radius": `${token.borderRadiusLG}px`,
});

export const getCommentSectionStyles = (token: EntityCommentsThemeToken): CommentSectionStyles => ({
    overlayStyle: {
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
        fontFamily: token.fontFamily,
        borderRadius: token.borderRadiusLG,
    },
    formStyle: {
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: token.padding,
    },
    inputStyle: {
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorder}`,
        fontFamily: token.fontFamily,
    },
    replyInputStyle: {
        color: token.colorText,
        borderBottom: `1px solid ${token.colorBorder}`,
        fontFamily: token.fontFamily,
    },
    submitBtnStyle: {
        border: `1px solid ${token.colorPrimary}`,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorPrimary,
        color: token.colorTextLightSolid,
    },
    cancelBtnStyle: {
        border: `1px solid ${token.colorFillSecondary}`,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorFillSecondary,
        color: token.colorTextSecondary,
    },
    hrStyle: {
        borderTopColor: token.colorBorderSecondary,
    },
    titleStyle: {
        color: token.colorTextHeading,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeHeading4,
    },
});

export const deepMergeConcatArrays = <T>(a: T, b: T): T =>
    mergeWith({}, a, b, (left: any, right: any) => {
        if (Array.isArray(left) && Array.isArray(right)) {
            return [...left, ...right];
        }
        return undefined;
    });

type QueryResult<TQuery> = UseQueryResult<TQuery, Error>;

const merger = <TQuery>(data: TQuery[], action: (a: TQuery, b: TQuery) => TQuery) => data.slice(1).reduce((acc, item) => {
    return action(acc, item);
}, data[0]);

export const combineResult = <TQuery>(
    results: readonly QueryResult<TQuery>[],
    mergeAction: (a: TQuery, b: TQuery) => TQuery,
) => {
    const data = merger(results.map(r => r.data!).filter(Boolean), mergeAction);
    const error = results.every(query => query.isError) ? results.find((query) => query.error)?.error : undefined;
    const failureReason = results.find((query) => query.failureReason)?.failureReason;

    const isError = results.every((query) => query.isError);
    const isPending = results.every((query) => query.isPending);
    const isLoading = results.every((query) => query.isLoading);
    const isFetching = results.every((query) => query.isFetching);
    const isFetched = results.some((query) => query.isFetched);
    const isFetchedAfterMount = results.some((query) => query.isFetchedAfterMount);
    const isPaused = results.some((query) => query.isPaused);
    const isPlaceholderData = results.some((query) => query.isPlaceholderData);
    const isStale = results.some((query) => query.isStale);
    const isSuccess = results.length > 0 && results.every((query) => query.isSuccess);

    const status: QueryStatus = isPending ? "pending" : isError ? "error" : "success";
    const fetchStatus: FetchStatus = isFetching ? "fetching" : isPaused ? "paused" : "idle";

    const hasData = Array.isArray(data) ? data.length > 0 : Boolean(data);
    const isLoadingError = isError && !hasData;
    const isRefetchError = isError && hasData;

    const refetch = async (
        options?: RefetchOptions,
    ): Promise<QueryObserverResult<TQuery, Error>> => {
        const refetched = await Promise.all(results.map((query) => query.refetch(options)));
        return combineResult(refetched, mergeAction);
    };

    return {
        data,
        dataUpdatedAt: maxBy(results, (query) => query.dataUpdatedAt)?.dataUpdatedAt || 0,
        error,
        errorUpdateCount: results.reduce((sum, query) => sum + query.errorUpdateCount, 0),
        errorUpdatedAt: maxBy(results, (query) => query.errorUpdatedAt)?.errorUpdatedAt || 0,
        failureCount: results.reduce((sum, query) => sum + query.failureCount, 0),
        failureReason,
        fetchStatus,
        isError,
        isFetched,
        isFetchedAfterMount,
        isFetching,
        isInitialLoading: isLoading,
        isLoading,
        isLoadingError,
        isPaused,
        isPending,
        isPlaceholderData,
        isRefetchError,
        isRefetching: isFetching && !isPending,
        isStale,
        isSuccess,
        refetch,
        status,
    } as QueryResult<TQuery>;
};
