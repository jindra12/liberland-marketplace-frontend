import { createCompanyRef, createCryptoPriceNode, createImageRef, createIdentityRef, createNodeRef, createProductRef, createTransactionHashNode, createTransactionRef, createUserRef, createVariantRef } from "./responseHelpers";
import { isPlainObject, searchNode } from "./runtimeState";
import type { MockNode } from "./types";

const normalizeSharedRelations = (data: Record<string, unknown>, key: "company" | "identity" | "createdBy") => {
    const value = data[key];
    if (typeof value === "string") {
        if (key === "company") {
            data[key] = createCompanyRef(value);
        } else {
            data[key] = createIdentityRef(value);
        }
    }
};

export const normalizeCompanyData = (data: Record<string, unknown>) => {
    normalizeSharedRelations(data, "identity");
    normalizeSharedRelations(data, "createdBy");
    if (typeof data.image === "string") {
        data.image = createImageRef(data.image);
    }
    if (Array.isArray(data.allowedIdentities)) {
        data.allowedIdentities = data.allowedIdentities
            .filter((value): value is string => typeof value === "string")
            .map((value) => createIdentityRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (Array.isArray(data.disallowedIdentities)) {
        data.disallowedIdentities = data.disallowedIdentities
            .filter((value): value is string => typeof value === "string")
            .map((value) => createIdentityRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (isPlainObject(data.cryptoAddresses)) {
        data.cryptoAddresses = [
            searchNode({
                chain: data.cryptoAddresses.chain,
                address: data.cryptoAddresses.address,
            }),
        ];
    }
};

export const normalizeJobData = (data: Record<string, unknown>) => {
    normalizeSharedRelations(data, "company");
    normalizeSharedRelations(data, "createdBy");
    if (typeof data.image === "string") {
        data.image = createImageRef(data.image);
    }
    if (Array.isArray(data.allowedIdentities)) {
        data.allowedIdentities = data.allowedIdentities
            .filter((value): value is string => typeof value === "string")
            .map((value) => createIdentityRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (Array.isArray(data.disallowedIdentities)) {
        data.disallowedIdentities = data.disallowedIdentities
            .filter((value): value is string => typeof value === "string")
            .map((value) => createIdentityRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (isPlainObject(data.bounty)) {
        data.bounty = searchNode({
            amount: data.bounty.amount,
            currency: data.bounty.currency,
        });
    }
    if (isPlainObject(data.salaryRange)) {
        data.salaryRange = searchNode({
            min: data.salaryRange.min,
            max: data.salaryRange.max,
            currency: data.salaryRange.currency,
        });
    }
};

export const normalizeProductData = (data: Record<string, unknown>) => {
    normalizeSharedRelations(data, "company");
    normalizeSharedRelations(data, "createdBy");
    if (typeof data.image === "string") {
        data.image = createImageRef(data.image);
    }
    if (isPlainObject(data.cryptoAddresses)) {
        data.cryptoAddresses = [
            searchNode({
                chain: data.cryptoAddresses.chain,
                address: data.cryptoAddresses.address,
            }),
        ];
    }
    if (Array.isArray(data.properties)) {
        data.properties = data.properties
            .filter((value): value is Record<string, unknown> => isPlainObject(value))
            .map((value, index) =>
                searchNode({
                    id: typeof value.id === "string" ? value.id : `product-property-${index + 1}`,
                    key: value.key,
                    value: value.value,
                }),
            );
    }
    if (Array.isArray(data.variantTypes)) {
        data.variantTypes = data.variantTypes
            .filter((value): value is string => typeof value === "string")
            .map((value) => createNodeRef(value));
    }
};

export const normalizeStartupData = (data: Record<string, unknown>) => {
    normalizeSharedRelations(data, "company");
    normalizeSharedRelations(data, "createdBy");
    normalizeSharedRelations(data, "identity");
    if (typeof data.image === "string") {
        data.image = createImageRef(data.image);
    }
    if (Array.isArray(data.involvedUsers)) {
        data.involvedUsers = data.involvedUsers
            .filter((value): value is string => typeof value === "string")
            .map((value) => createUserRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (isPlainObject(data.fundsNeeded)) {
        data.fundsNeeded = searchNode({
            amount: data.fundsNeeded.amount,
            currency: data.fundsNeeded.currency,
        });
    }
};

export const normalizePostData = (data: Record<string, unknown>) => {
    normalizeSharedRelations(data, "company");
    if (typeof data.heroImage === "string") {
        data.heroImage = createImageRef(data.heroImage);
    }
    if (isPlainObject(data.meta)) {
        if (typeof data.meta.image === "string") {
            data.meta.image = createImageRef(data.meta.image);
        }
        data.meta = searchNode({
            title: data.meta.title,
            description: data.meta.description,
            image: data.meta.image,
        });
    }
    if (Array.isArray(data.categories)) {
        data.categories = data.categories
            .filter((value): value is string | Record<string, unknown> => typeof value === "string" || isPlainObject(value))
            .map((value, index) => {
                if (typeof value === "string") {
                    return searchNode({
                        id: value,
                        title: value,
                        slug: value,
                    });
                }

                const id = typeof value.id === "string" ? value.id : `post-category-${index + 1}`;
                return searchNode({
                    id,
                    title: typeof value.title === "string" ? value.title : id,
                    slug: typeof value.slug === "string" ? value.slug : id,
                });
            });
    }
    if (Array.isArray(data.populatedAuthors)) {
        data.populatedAuthors = data.populatedAuthors
            .filter((value): value is string | Record<string, unknown> => typeof value === "string" || isPlainObject(value))
            .map((value, index) => {
                if (typeof value === "string") {
                    return searchNode({
                        id: value,
                        nickname: value,
                        image: null,
                    });
                }

                if (typeof value.image === "string") {
                    value.image = createImageRef(value.image);
                }

                const id = typeof value.id === "string" ? value.id : `post-populated-author-${index + 1}`;
                return searchNode({
                    id,
                    nickname: typeof value.nickname === "string" ? value.nickname : typeof value.name === "string" ? value.name : id,
                    image: value.image,
                });
            });
    }
};

const normalizeCartItems = (items: unknown, prefix: string): MockNode[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((value): value is Record<string, unknown> => isPlainObject(value))
        .map((value, index) =>
            searchNode({
                id: typeof value.id === "string" ? value.id : `${prefix}-item-${index + 1}`,
                quantity: value.quantity,
                product: createProductRef(typeof value.product === "string" ? value.product : undefined),
                variant: createVariantRef(typeof value.variant === "string" ? value.variant : undefined),
            }),
        );
};

const normalizeOrderItems = (items: unknown, prefix: string): MockNode[] => {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter((value): value is Record<string, unknown> => isPlainObject(value))
        .map((value, index) =>
            searchNode({
                id: typeof value.id === "string" ? value.id : `${prefix}-item-${index + 1}`,
                quantity: value.quantity,
                product: createProductRef(typeof value.product === "string" ? value.product : undefined),
                variant: createVariantRef(typeof value.variant === "string" ? value.variant : undefined),
            }),
        );
};

export const normalizeOrderData = (data: Record<string, unknown>) => {
    if (typeof data.customer === "string") {
        data.customer = createUserRef(data.customer);
    }
    if (Array.isArray(data.transactions)) {
        data.transactions = data.transactions
            .filter((value): value is string => typeof value === "string")
            .map((value) => createTransactionRef(value))
            .filter((value): value is MockNode => value !== null);
    }
    if (Array.isArray(data.cryptoPrices)) {
        data.cryptoPrices = data.cryptoPrices
            .filter((value): value is Record<string, unknown> => isPlainObject(value))
            .map((value, index) => createCryptoPriceNode(value, "order", index));
    }
    if (Array.isArray(data.transactionHashes)) {
        data.transactionHashes = data.transactionHashes
            .filter((value): value is Record<string, unknown> => isPlainObject(value))
            .map((value, index) => createTransactionHashNode(value, "order", index));
    }
    if (isPlainObject(data.shippingAddress)) {
        data.shippingAddress = searchNode({
            title: data.shippingAddress.title,
            firstName: data.shippingAddress.firstName,
            lastName: data.shippingAddress.lastName,
            company: data.shippingAddress.company,
            addressLine1: data.shippingAddress.addressLine1,
            addressLine2: data.shippingAddress.addressLine2,
            city: data.shippingAddress.city,
            postalCode: data.shippingAddress.postalCode,
            state: data.shippingAddress.state,
            country: data.shippingAddress.country,
            phone: data.shippingAddress.phone,
        });
    }
    if (Array.isArray(data.items)) {
        data.items = normalizeOrderItems(data.items, "order");
    }
};

export const normalizeCartData = (data: Record<string, unknown>) => {
    if (typeof data.customer === "string") {
        data.customer = createUserRef(data.customer);
    }
    if (Array.isArray(data.items)) {
        data.items = normalizeCartItems(data.items, "cart");
    }
};

export const normalizeCommentData = (data: Record<string, unknown>) => {
    if (isPlainObject(data.replyPost)) {
        const relationTo = typeof data.replyPost.relationTo === "string" ? data.replyPost.relationTo : undefined;
        const value = typeof data.replyPost.value === "string" ? data.replyPost.value : undefined;

        data.replyPostRelationTo = relationTo;
        data.replyPostValue = value;
        data.replyPost = searchNode({
            relationTo,
            value: value ? createNodeRef(value) : undefined,
        });
    }

    if (typeof data.replyComment === "string") {
        data.replyComment = createNodeRef(data.replyComment);
    }
};

export const normalizeUserData = (data: Record<string, unknown>) => {
    if (isPlainObject(data.shippingAddress)) {
        data.shippingAddress = searchNode({
            title: data.shippingAddress.title,
            firstName: data.shippingAddress.firstName,
            lastName: data.shippingAddress.lastName,
            company: data.shippingAddress.company,
            addressLine1: data.shippingAddress.addressLine1,
            addressLine2: data.shippingAddress.addressLine2,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state,
            postalCode: data.shippingAddress.postalCode,
            country: data.shippingAddress.country,
            phone: data.shippingAddress.phone,
        });
    }
    if (Array.isArray(data.wallets)) {
        data.wallets = data.wallets
            .filter((value): value is Record<string, unknown> => isPlainObject(value))
            .map((value, index) =>
                searchNode({
                    id: typeof value.id === "string" ? value.id : `wallet-${index + 1}`,
                    chain: value.chain,
                    provider: value.provider,
                    address: value.address,
                }),
            );
    }
};
