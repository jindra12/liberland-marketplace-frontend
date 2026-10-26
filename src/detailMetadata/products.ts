import type { ListProductsByCompanyQuery, ProductByIdQuery } from "../generated/graphql";
import { fetchListProductsByCompany } from "../server/queries";

import {
    buildAbsoluteImageUrl,
    buildActionSentence,
    buildStandardDetailMetadata,
    normalizeWhitespace,
    SITE_URL,
} from "./shared";
import { buildDetailUrl, buildItemListJsonLd } from "./related";
import { buildProductOffers, getMetadataServerUrl } from "./utils";
import { fromCents } from "../components/shared/product/utils";

type ProductRelatedMetadata = {
    products: ListProductsByCompanyQuery["Products"];
};

const buildProductRelatedItems = (
    product: NonNullable<ProductByIdQuery["Product"]>,
    fallbackServerUrl: string,
    related?: ProductRelatedMetadata,
) => {
    const sourceServerUrl = product.serverURL || fallbackServerUrl;
    const companyItems =
        product.company?.name && product.company?.id
            ? buildItemListJsonLd("Company", [
                  {
                      label: product.company.name,
                      url: buildDetailUrl("/companies", product.company.id, product.company.serverURL || sourceServerUrl),
                  },
              ])
            : [];
    const identityItems =
        product.company?.identity?.name && product.company?.identity?.id
            ? buildItemListJsonLd("Identity", [
                  {
                      label: product.company.identity.name,
                      url: buildDetailUrl("/tribes", product.company.identity.id, product.company.identity.serverURL || product.company.serverURL || sourceServerUrl),
                  },
              ])
            : [];
    const relatedProductItems = buildItemListJsonLd(
        "Related products and services",
        (product.relatedProducts || []).map((relatedProduct) => ({
            label: relatedProduct.name ?? "Product",
            url: buildDetailUrl("/products-services", relatedProduct.id, relatedProduct.serverURL || sourceServerUrl),
        })),
    );
    const companyProductItems = buildItemListJsonLd(
        "Company products and services",
        (related?.products?.docs || []).map((companyProduct) => ({
            label: companyProduct.name ?? "Product",
            url: buildDetailUrl("/products-services", companyProduct.id, companyProduct.serverURL || product.company?.serverURL || sourceServerUrl),
        })),
    );

    return [...companyItems, ...identityItems, ...relatedProductItems, ...companyProductItems];
};

export const buildProductPageMetadata = (
    product: NonNullable<ProductByIdQuery["Product"]>,
    canonicalPath: string,
    related?: ProductRelatedMetadata,
) => {
    const detailLabel = product.name ?? "Product or service detail";
    const priceDetails = [
        product.priceInUSDEnabled && product.priceInUSD !== null && product.priceInUSD !== undefined
            ? `USD ${fromCents(product.priceInUSD)}`
            : "",
        product.priceInETH !== null && product.priceInETH !== undefined ? `${product.priceInETH} ETH` : "",
        product.priceInSOL !== null && product.priceInSOL !== undefined ? `${product.priceInSOL} SOL` : "",
        product.priceInTRX !== null && product.priceInTRX !== undefined ? `${product.priceInTRX} TRX` : "",
    ]
        .filter((value) => value !== "")
        .join(", ");
    const description = normalizeWhitespace(
        `${product.description ?? `Detail page for ${product.name ?? "a product or service"}.`}${
            priceDetails ? ` Prices include ${priceDetails}.` : ""
        } ${buildActionSentence([
            "compare prices and inventory",
            "review variants and parameters",
            "open the company profile",
            "place an order if the item is orderable",
        ])}`,
    );

    return buildStandardDetailMetadata(
        "Products and services",
        "/products-services",
        detailLabel,
        description,
        canonicalPath,
        [
            {
                "@context": "https://schema.org",
                "@type": "Product",
                name: detailLabel,
                description,
                image: buildAbsoluteImageUrl(product.image?.url),
                sku: product.id,
                offers: buildProductOffers(product, `${SITE_URL}${canonicalPath}`, getMetadataServerUrl(canonicalPath)),
                identifier: product.id,
            },
            ...buildProductRelatedItems(product, getMetadataServerUrl(canonicalPath), related),
        ],
        {
            imageUrl: buildAbsoluteImageUrl(product.image?.url ?? product.company?.image?.url),
            imageAlt: product.image?.filename ?? detailLabel,
            ogType: "product",
            extraMetaTags:
                product.priceInUSDEnabled && typeof product.priceInUSD === "number"
                    ? [
                          {
                              property: "product:price:amount",
                              content: String(fromCents(product.priceInUSD)),
                          },
                          {
                              property: "product:price:currency",
                              content: "USD",
                          },
                      ]
                    : [],
        },
    );
};

export const fetchProductRelatedMetadata = async (
    product: NonNullable<ProductByIdQuery["Product"]>,
    _params: { id?: string; serverUrl?: string },
    serverUrl: string,
): Promise<ProductRelatedMetadata> => {
    const url = product.serverURL || serverUrl;

    if (!url || !product.company?.id) {
        return {
            products: undefined,
        };
    }

    const products = await fetchListProductsByCompany({ companyId: product.company.id, page: 1, limit: 5 }, url);

    return {
        products: products.Products,
    };
};
