import { fetchHomepageProducts } from "../../collectionMetadata";
import { SEO_BY_ROUTE } from "../../shellPage/seo";
import { buildSiteUrl } from "../../siteUrl";
import type { CollectionPageProps } from "../types";

export const fetchHomepageMetadata = async (): Promise<CollectionPageProps> => {
    const seo = SEO_BY_ROUTE["/"];
    const metadata: CollectionPageProps = {
        title: seo.title,
        description: seo.description,
        canonicalPath: "/",
        jsonLd: seo.buildJsonLd?.("/") || [],
        extraMetaTags: seo.keywords?.length ? [{ name: "keywords", content: seo.keywords.join(", ") }] : [],
        extraLinks: [],
    };
    try {
        const products = await fetchHomepageProducts();
        return {
            ...metadata,
            jsonLd: [
                ...metadata.jsonLd,
                ...products.map((product) => ({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "@id": product.url,
                    name: product.name,
                    description: product.description,
                    url: product.url,
                    offers: product.offers,
                })),
            ],
            content: {
                title: seo.title,
                description: `${seo.description} Browse products and services, compare seller offers, and add orderable items to your cart. At checkout, review and submit your orders and approve payments yourself in the app. Each syndicated backend has independent accounts, carts and orders.`,
                items: products.map((product) => ({
                    name: product.name,
                    url: product.url,
                    description: product.description || "",
                })),
                links: [
                    { name: "Browse all products and services", url: buildSiteUrl("/products-services") },
                    { name: "Shopping and authentication guide", url: buildSiteUrl("/auth.txt") },
                ],
            },
        };
    } catch (error) {
        console.error("Homepage product discovery unavailable", error);
        return metadata;
    }
};
