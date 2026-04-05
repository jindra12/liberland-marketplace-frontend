import { SYNDICATION_SERVERS } from "../support/constants";
import { resetMockScenario, setInitialPath } from "../support/marketplace";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

const buildDocument = (operationName: string, type: "query" | "mutation"): string => {
    return `${type} ${operationName} { __typename }`;
};

const postGraphql = <T,>(props: {
    operationName: string;
    type?: "query" | "mutation";
    url: string;
    variables?: Record<string, unknown>;
}) => {
    return cy
        .request<T>({
            body: {
                operationName: props.operationName,
                query: buildDocument(props.operationName, props.type ?? "query"),
                variables: props.variables ?? {},
            },
            failOnStatusCode: true,
            method: "POST",
            url: `${props.url}/api/graphql`,
        })
        .its("body");
};

describe("mock servers", () => {
    beforeEach(() => {
        resetMockScenario(alphaUrl);
        resetMockScenario(betaUrl);
        setInitialPath("/");
    });

    it("syndication mock servers expose scenario switching and distinct syndication data", () => {
        cy.request(`${alphaUrl}/__admin/scenarios`).then((response) => {
            expect(response.body.currentScenario).to.eq("default");
            expect(response.body.availableScenarios).to.contain("subscribed");
        });

        cy.request(`${betaUrl}/__admin/scenarios`).then((response) => {
            expect(response.body.currentScenario).to.eq("default");
            expect(response.body.availableScenarios).to.contain("prefilled-checkout");
        });

        postGraphql<{ data: { Syndications: { docs: Array<{ name: string }> } } }>({
            operationName: "ListPublishedSyndicationUrls",
            url: alphaUrl,
        }).then((body) => {
            expect(body.data.Syndications.docs).to.have.length(0);
        });

        postGraphql<{ data: { Syndications: { docs: Array<{ name: string }> } } }>({
            operationName: "ListPublishedSyndicationUrls",
            url: betaUrl,
        }).then((body) => {
            expect(body.data.Syndications.docs[0].name).to.eq("Alpha Mock Market");
        });

        cy.request({
            body: { scenario: "subscribed" },
            method: "POST",
            url: `${alphaUrl}/__admin/scenario`,
        });

        postGraphql<{ data: { Company: { id: string; isSubscribed: boolean } | null } }>({
            operationName: "CompanyById",
            url: alphaUrl,
            variables: { id: "alpha-company-complete" },
        }).then((body) => {
            expect(body.data.Company?.isSubscribed).to.eq(true);
        });

        cy.request({
            body: { scenario: "empty" },
            method: "POST",
            url: `${alphaUrl}/__admin/scenario`,
        });

        postGraphql<{ data: { Companies: { totalDocs: number } } }>({
            operationName: "ListCompanies",
            url: alphaUrl,
        }).then((body) => {
            expect(body.data.Companies.totalDocs).to.eq(0);
        });
    });

    it("mock servers cover linked companies jobs startups identities and product orderability states", () => {
        postGraphql<{ data: { Products: { docs: Array<{ id: string; inventory: number | null; name: string; orderable: boolean | null }> } } }>({
            operationName: "ListProducts",
            url: alphaUrl,
        }).then((alphaBody) => {
            postGraphql<{ data: { Products: { docs: Array<{ id: string; inventory: number | null; name: string; orderable: boolean | null }> } } }>({
                operationName: "ListProducts",
                url: betaUrl,
            }).then((betaBody) => {
                postGraphql<{ data: { Jobs: { totalDocs: number } } }>({
                    operationName: "ListJobsByCompany",
                    url: alphaUrl,
                    variables: { companyId: "alpha-company-complete" },
                }).then((alphaJobs) => {
                    postGraphql<{ data: { Startups: { totalDocs: number } } }>({
                        operationName: "ListStartupsByCompany",
                        url: alphaUrl,
                        variables: { companyId: "alpha-company-complete" },
                    }).then((alphaStartups) => {
                        postGraphql<{ data: { Jobs: { totalDocs: number } } }>({
                            operationName: "ListJobsByCompany",
                            url: betaUrl,
                            variables: { companyId: "beta-company-ecosystem" },
                        }).then((betaJobs) => {
                            postGraphql<{ data: { Startups: { totalDocs: number } } }>({
                                operationName: "ListStartupsByCompany",
                                url: betaUrl,
                                variables: { companyId: "beta-company-ecosystem" },
                            }).then((betaStartups) => {
                                postGraphql<{ data: { Identity: { description: string | null; name: string } | null } }>({
                                    operationName: "IdentityById",
                                    url: betaUrl,
                                    variables: { id: "beta-identity-partial" },
                                }).then((betaIdentity) => {
                                    postGraphql<{ data: { Companies: { totalDocs: number } } }>({
                                        operationName: "ListCompaniesByIdentity",
                                        url: betaUrl,
                                        variables: { identityId: "beta-identity-network" },
                                    }).then((betaIdentityCompanies) => {
                                        expect(alphaBody.data.Products.docs.find((product) => product.id === "alpha-product-advisory")?.orderable).to.eq(false);
                                        expect(alphaBody.data.Products.docs.find((product) => product.id === "alpha-product-coffee")?.inventory).to.eq(40);
                                        expect(betaBody.data.Products.docs.find((product) => product.id === "beta-product-node")?.orderable).to.eq(true);
                                        expect(betaBody.data.Products.docs.find((product) => product.id === "beta-product-node")?.inventory).to.eq(24);
                                        expect(alphaJobs.data.Jobs.totalDocs).to.eq(0);
                                        expect(alphaStartups.data.Startups.totalDocs).to.eq(0);
                                        expect(betaJobs.data.Jobs.totalDocs).to.be.greaterThan(0);
                                        expect(betaStartups.data.Startups.totalDocs).to.be.greaterThan(0);
                                        expect(betaIdentity.data.Identity?.description).to.eq(null);
                                        expect(betaIdentity.data.Identity?.name).to.eq("Quiet Orbit");
                                        expect(betaIdentityCompanies.data.Companies.totalDocs).to.eq(2);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
