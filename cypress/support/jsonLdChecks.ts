import assert from "node:assert/strict";
import dns from "node:dns";
import { syncBuiltinESMExports } from "node:module";
import { mock } from "node:test";
import type { CompanyByIdQuery, JobByIdQuery, ProductByIdQuery } from "../../src/generated/graphql";
import type { JsonLdResponse } from "../../src/server/jsonLd/types";

const serverUrl = "https://metadata.example";
const encoded = Buffer.from(serverUrl).toString("hex");
const tribe = { id: "tribe-id", name: "Liberland", description: "A marketplace community", website: "https://tribe.example" };
const company: NonNullable<CompanyByIdQuery["Company"]> = {
    id: "company-id", name: "Coffee company", description: "Coffee services", website: "https://coffee.example", identity: tribe,
};
const product: NonNullable<ProductByIdQuery["Product"]> = {
    id: "product-id", name: "Coffee", company, priceInUSDEnabled: true, priceInUSD: 1299,
    priceInETH: "0.005", orderable: true, inventory: 5,
};

const responseRecorder = () => {
    const headers = new Map<string, string>();
    const bodies: string[] = [];
    const response: JsonLdResponse = {
        getHeader: (name) => headers.get(name),
        setHeader: (name, value) => { headers.set(name, value); },
        end: (body = "") => { bodies.push(body); },
    };
    return { response, headers, bodies };
};

export const jsonLdChecks = {
    jsonLdAlternatives: async () => {
        const { jsonLdPageResponse } = await import("../../src/server/jsonLd/utils");
        const { SITE_URL } = await import("../../src/siteUrl");
        const metadata = {
            title: "Companies", canonicalPath: `/companies?tribeId=tribe-id&serverUrl=${encodeURIComponent(serverUrl)}&page=2&limit=5`,
            jsonLd: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "</script><script>inert()</script>", optional: undefined }],
        };
        const html = responseRecorder();
        html.headers.set("Link", '</companies?page=1>; rel="prev"');
        const htmlResult = jsonLdPageResponse(metadata, {}, html.response);
        const alternate = new URL(htmlResult.props.jsonLdAlternateUrl);
        assert.equal(alternate.searchParams.get("tribeId"), "tribe-id");
        assert.equal(alternate.searchParams.get("serverUrl"), serverUrl);
        assert.equal(alternate.searchParams.get("page"), "2");
        assert.equal(alternate.searchParams.get("limit"), "5");
        assert.equal(alternate.searchParams.get("format"), "jsonld");
        assert.match(html.headers.get("Link")!, /rel="alternate"; type="application\/ld\+json"/);
        assert.match(html.headers.get("Link")!, /rel="prev"/);
        assert.equal(html.bodies.length, 0, "Normal HTML requests must not be ended by the metadata helper");
        const json = responseRecorder();
        const jsonResult = jsonLdPageResponse(metadata, { format: "jsonld" }, json.response);
        assert.equal(json.headers.get("Content-Type"), "application/ld+json; charset=utf-8");
        assert.equal(json.headers.get("X-Content-Type-Options"), "nosniff");
        assert.equal(json.headers.get("Content-Location"), alternate.href);
        assert.match(json.headers.get("Link")!, /rel="canonical"/);
        assert.equal(json.bodies.length, 1);
        assert.deepEqual(JSON.parse(json.bodies[0]), { "@context": "https://schema.org", "@graph": htmlResult.props.jsonLd });
        assert.deepEqual(jsonResult.props.jsonLd, htmlResult.props.jsonLd);
        assert(!json.bodies[0].includes("</script>"));
        assert.equal(alternate.origin, SITE_URL);
        return true;
    },
    jsonLdRelationships: async () => {
        const { buildCompanyPageMetadata } = await import("../../src/detailMetadata/companies");
        const { buildJobPageMetadata } = await import("../../src/detailMetadata/jobs");
        const { buildProductPageMetadata } = await import("../../src/detailMetadata/products");
        const { buildIdentityPageMetadata } = await import("../../src/detailMetadata/identity");
        const { buildCompanyReference, buildTribeReference, buildProductOffers } = await import("../../src/detailMetadata/utils");
        const { SITE_URL } = await import("../../src/siteUrl");
        const companyPath = `/companies/${company.id}/${encoded}`;
        const productPath = `/products-services/${product.id}/${encoded}`;
        const tribePath = `/tribes/${tribe.id}/${encoded}`;
        const companyMetadata = buildCompanyPageMetadata(company, companyPath);
        const organization = companyMetadata.jsonLd.find((node) => node["@type"] === "Organization");
        assert(organization);
        assert.equal(organization["@id"], `${SITE_URL}${companyPath}`);
        assert.equal(organization.url, `${SITE_URL}${companyPath}`);
        assert.deepEqual(organization.sameAs, [company.website]);
        assert.deepEqual(organization.memberOf, buildTribeReference(tribe, serverUrl));
        assert.match(JSON.stringify(organization.memberOf), new RegExp(`/tribes/${tribe.id}/${encoded}`));
        const page = companyMetadata.jsonLd.find((node) => node["@type"] === "WebPage");
        assert.deepEqual(page?.mainEntity, { "@id": organization["@id"] });
        assert.deepEqual(organization.mainEntityOfPage, { "@id": `${SITE_URL}${companyPath}#webpage` });
        const tribeMetadata = buildIdentityPageMetadata(tribe, tribePath);
        assert.equal(tribeMetadata.jsonLd.find((node) => node["@type"] === "Organization")?.["@id"], `${SITE_URL}${tribePath}`);
        const job: NonNullable<JobByIdQuery["Job"]> = { id: "job-id", title: "Developer", company, location: "Remote" };
        const jobMetadata = buildJobPageMetadata(job, `/jobs/${job.id}/${encoded}`);
        assert.deepEqual(jobMetadata.jsonLd.find((node) => node["@type"] === "JobPosting")?.hiringOrganization, { ...buildCompanyReference(company, serverUrl), logo: undefined });
        const productMetadata = buildProductPageMetadata(product, productPath);
        const productNode = productMetadata.jsonLd.find((node) => node["@type"] === "Product");
        assert.deepEqual(productNode?.offers, buildProductOffers(product, `${SITE_URL}${productPath}`, serverUrl));
        assert.match(JSON.stringify(productNode?.offers), new RegExp(`/companies/${company.id}/${encoded}`));
        assert.match(JSON.stringify(productNode?.offers), /memberOf/);
        assert(!("brand" in productNode!), "A seller is not necessarily a product's brand");
        const foreign = buildCompanyReference({ ...company, serverURL: "https://other.example", identity: { ...tribe, serverURL: "https://tribe-backend.example" } }, serverUrl);
        assert.notEqual(foreign["@id"], organization["@id"]);
        assert.match(JSON.stringify(foreign.memberOf), new RegExp(Buffer.from("https://tribe-backend.example").toString("hex")));
        return true;
    },
    jsonLdOfferAccuracy: async () => {
        const { buildProductOffers } = await import("../../src/detailMetadata/utils");
        const url = `https://market.example/products-services/product-id/${encoded}`;
        const offers = buildProductOffers(product, url, serverUrl);
        assert.equal(offers.length, 2);
        assert.equal(offers[0].price, 12.99);
        assert.equal(offers[0].priceCurrency, "USD");
        assert.equal(offers[1].price, "0.005");
        assert.equal(offers[1].priceCurrency, "ETH");
        const cryptoOnly = buildProductOffers({ ...product, priceInUSDEnabled: false }, url, serverUrl);
        assert.equal(cryptoOnly.length, 1);
        assert.equal(cryptoOnly[0].priceCurrency, "ETH");
        const precise = buildProductOffers({ priceInETH: "0.000000000000000001" }, url, serverUrl);
        assert.equal(precise[0].price, "0.000000000000000001");
        const free = buildProductOffers({ ...product, priceInUSD: 0, priceInETH: null }, url, serverUrl);
        assert.equal(free[0].price, 0);
        const unpriced = buildProductOffers({ company, orderable: false }, url, serverUrl)[0];
        assert(!("price" in unpriced));
        assert(!("priceCurrency" in unpriced));
        assert(!("availability" in unpriced));
        return true;
    },
    jsonLdListingRelationships: async () => {
        const { buildTribeListingMetadata } = await import("../../src/tribeSearch/utils");
        const { buildCollectionJsonLd } = await import("../../src/shellPage/seo");
        const { buildCompanyReference } = await import("../../src/detailMetadata/utils");
        const input = { entity: "jobs" as const, page: 1, limit: 20 };
        const filtered = buildTribeListingMetadata(input, tribe, serverUrl, { docs: [{ id: "job-id", title: "Developer", company }], totalDocs: 1, hasNextPage: false });
        assert.match(JSON.stringify(filtered.jsonLd), /hiringOrganization/);
        assert.match(JSON.stringify(filtered.jsonLd), /memberOf/);
        const jobUrl = `https://market.example/jobs/job-id/${encoded}`;
        const collection = buildCollectionJsonLd("Jobs", "/jobs", "Published jobs")("/jobs", 1, {
            items: [{ name: "Developer", type: "JobPosting", url: jobUrl, company }], page: 1, totalItems: 1, totalPages: 1, hasNextPage: false,
        });
        assert(JSON.stringify(collection).includes(JSON.stringify(buildCompanyReference(company, serverUrl))));
        return true;
    },
    jsonLdGeneratedQueryReuse: async () => {
        const { fetchCollectionPageMetadata } = await import("../../src/collectionMetadata");
        const { ListCompaniesDocument } = await import("../../src/generated/graphql");
        const previous = process.env.REACT_APP_BACKEND_URL;
        process.env.REACT_APP_BACKEND_URL = serverUrl;
        const lookup = mock.method(dns.promises, "lookup", async () => [{ address: "8.8.8.8", family: 4 }]);
        syncBuiltinESMExports();
        const fetchMock = mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
            const request = new Request(input, init);
            const body = await request.json() as { query: string };
            assert.equal(body.query, ListCompaniesDocument);
            return Response.json({ data: { Companies: { docs: [company], totalDocs: 1, totalPages: 1, hasNextPage: false } } });
        });
        try {
            const metadata = await fetchCollectionPageMetadata("/companies", "/companies", 1);
            assert.match(JSON.stringify(metadata.jsonLd), /memberOf/);
            assert.match(JSON.stringify(metadata.jsonLd), new RegExp(`/companies/${company.id}/${encoded}`));
            assert.equal(fetchMock.mock.callCount(), 1);
        } finally {
            fetchMock.mock.restore();
            lookup.mock.restore();
            syncBuiltinESMExports();
            if (previous === undefined) {
                delete process.env.REACT_APP_BACKEND_URL;
            } else {
                process.env.REACT_APP_BACKEND_URL = previous;
            }
        }
        return true;
    },
};
