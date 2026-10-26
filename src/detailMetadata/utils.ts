import type { OfferLeaf, OrganizationLeaf } from "schema-dts";
import { decodeServerUrlSegment } from "../routes";
import { fromCents } from "../components/shared/product/utils";
import { buildDetailUrl } from "./related";
import type { MetadataCompany, MetadataProduct, MetadataRelationships, MetadataTribe } from "./types";

export const getMetadataServerUrl = (canonicalPath: string): string => {
    const segment = canonicalPath.split("/").pop();
    const decoded = segment ? decodeServerUrlSegment(segment) : "";
    if (decoded) {
        return decoded;
    }
    if (!process.env.REACT_APP_BACKEND_URL) {
        throw new Error("A source backend URL is required for linked metadata.");
    }
    return process.env.REACT_APP_BACKEND_URL;
};

export const buildTribeReference = (tribe: MetadataTribe, fallbackServerUrl: string): OrganizationLeaf => {
    const url = buildDetailUrl("/tribes", tribe.id, tribe.serverURL || fallbackServerUrl);
    return {
        "@type": "Organization",
        "@id": url,
        url,
        identifier: tribe.id,
        name: tribe.name,
        ...(tribe.description ? { description: tribe.description } : {}),
        ...(tribe.website ? { sameAs: [tribe.website] } : {}),
    };
};

export const buildCompanyReference = (company: MetadataCompany, fallbackServerUrl: string): OrganizationLeaf => {
    const serverUrl = company.serverURL || fallbackServerUrl;
    const url = buildDetailUrl("/companies", company.id, serverUrl);
    return {
        "@type": "Organization",
        "@id": url,
        url,
        identifier: company.id,
        ...(company.name ? { name: company.name } : {}),
        ...(company.description ? { description: company.description } : {}),
        ...(company.website ? { sameAs: [company.website] } : {}),
        ...(company.identity ? { memberOf: buildTribeReference(company.identity, serverUrl) } : {}),
    };
};

export const buildProductOffers = (product: MetadataProduct, productUrl: string, fallbackServerUrl: string): OfferLeaf[] => {
    const prices = [
        { currency: "USD", price: product.priceInUSDEnabled ? fromCents(product.priceInUSD) : null },
        { currency: "ETH", price: product.priceInETH },
        { currency: "SOL", price: product.priceInSOL },
        { currency: "TRX", price: product.priceInTRX },
    ].flatMap((entry) => {
        if (typeof entry.price === "number" || (typeof entry.price === "string" && entry.price.length > 0)) {
            return [{ currency: entry.currency, price: entry.price }];
        }
        return [];
    });
    const offer: OfferLeaf = {
        "@type": "Offer",
        "@id": `${productUrl}#offer`,
        url: product.url || productUrl,
        itemOffered: { "@id": productUrl },
        ...(product.company ? { seller: buildCompanyReference(product.company, fallbackServerUrl) } : {}),
        ...(product.orderable && typeof product.inventory === "number" ? {
            availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        } : {}),
        ...(!product.orderable ? { description: "This listing does not enable in-app ordering. Follow its URL or contact the seller." } : {}),
    };
    return prices.length ? prices.map((entry) => ({
        ...offer,
        "@id": `${productUrl}#offer-${entry.currency.toLowerCase()}`,
        price: entry.price,
        priceCurrency: entry.currency,
    })) : [offer];
};

export const buildListingRelationships = (item: MetadataRelationships & { type?: string; url: string }) => {
    const serverUrl = getMetadataServerUrl(item.url);
    switch (item.type) {
        case "Organization":
            return item.identity ? { memberOf: buildTribeReference(item.identity, serverUrl) } : {};
        case "JobPosting":
            return item.company ? { hiringOrganization: buildCompanyReference(item.company, serverUrl) } : {};
        case "Product":
            return { offers: item.offers };
        default:
            return {};
    }
};
