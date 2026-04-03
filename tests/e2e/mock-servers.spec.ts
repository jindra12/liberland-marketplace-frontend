import { APIRequestContext, expect, test } from "@playwright/test";

import { SYNDICATION_SERVERS } from "./fixtures/constants";
import type { GraphqlVariables } from "./servers/types";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

const buildDocument = (operationName: string, type: "query" | "mutation"): string => {
    return `${type} ${operationName} { __typename }`;
};

const postGraphql = async <T>(props: {
    operationName: string;
    request: APIRequestContext;
    type?: "query" | "mutation";
    url: string;
    variables?: GraphqlVariables;
}): Promise<T> => {
    const response = await props.request.post(`${props.url}/api/graphql`, {
        data: {
            operationName: props.operationName,
            query: buildDocument(props.operationName, props.type ?? "query"),
            variables: props.variables ?? {},
        },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as T;
};

const setScenario = async (request: APIRequestContext, url: string, scenario: string) => {
    const response = await request.post(`${url}/__admin/scenario`, {
        data: {
            scenario,
        },
    });
    expect(response.ok()).toBeTruthy();
};

const resetScenario = async (request: APIRequestContext, url: string, scenario = "default") => {
    const response = await request.post(`${url}/__admin/reset`, {
        data: {
            scenario,
        },
    });
    expect(response.ok()).toBeTruthy();
};

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ request }) => {
    await resetScenario(request, alphaUrl);
    await resetScenario(request, betaUrl);
});

test("syndication mock servers expose scenario switching and distinct syndication data", async ({ request }) => {
    const alphaScenarioSummary = await request.get(`${alphaUrl}/__admin/scenarios`);
    const betaScenarioSummary = await request.get(`${betaUrl}/__admin/scenarios`);
    const alphaScenarioJson = (await alphaScenarioSummary.json()) as {
        availableScenarios: string[];
        currentScenario: string;
    };
    const betaScenarioJson = (await betaScenarioSummary.json()) as {
        availableScenarios: string[];
        currentScenario: string;
    };

    expect(alphaScenarioJson.currentScenario).toBe("default");
    expect(alphaScenarioJson.availableScenarios).toContain("subscribed");
    expect(betaScenarioJson.currentScenario).toBe("default");
    expect(betaScenarioJson.availableScenarios).toContain("prefilled-checkout");

    const alphaSyndications = await postGraphql<{
        data: {
            Syndications: {
                docs: Array<{ name: string }>;
            };
        };
    }>({
        operationName: "ListPublishedSyndicationUrls",
        request,
        url: alphaUrl,
    });
    const betaSyndications = await postGraphql<{
        data: {
            Syndications: {
                docs: Array<{ name: string }>;
            };
        };
    }>({
        operationName: "ListPublishedSyndicationUrls",
        request,
        url: betaUrl,
    });

    expect(alphaSyndications.data.Syndications.docs).toHaveLength(0);
    expect(betaSyndications.data.Syndications.docs[0].name).toBe("Alpha Mock Market");

    await setScenario(request, alphaUrl, "subscribed");

    const subscribedCompany = await postGraphql<{
        data: {
            Company: {
                id: string;
                isSubscribed: boolean;
            } | null;
        };
    }>({
        operationName: "CompanyById",
        request,
        url: alphaUrl,
        variables: {
            id: "alpha-company-complete",
        },
    });

    expect(subscribedCompany.data.Company?.isSubscribed).toBe(true);

    await setScenario(request, alphaUrl, "empty");

    const emptyCompanies = await postGraphql<{
        data: {
            Companies: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListCompanies",
        request,
        url: alphaUrl,
    });

    expect(emptyCompanies.data.Companies.totalDocs).toBe(0);
});

test("mock servers cover linked companies jobs startups identities and product orderability states", async ({ request }) => {
    const alphaProducts = await postGraphql<{
        data: {
            Products: {
                docs: Array<{
                    id: string;
                    inventory: number | null;
                    name: string;
                    orderable: boolean | null;
                }>;
            };
        };
    }>({
        operationName: "ListProducts",
        request,
        url: alphaUrl,
    });
    const betaProducts = await postGraphql<{
        data: {
            Products: {
                docs: Array<{
                    id: string;
                    inventory: number | null;
                    name: string;
                    orderable: boolean | null;
                }>;
            };
        };
    }>({
        operationName: "ListProducts",
        request,
        url: betaUrl,
    });
    const alphaJobs = await postGraphql<{
        data: {
            Jobs: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListJobsByCompany",
        request,
        url: alphaUrl,
        variables: {
            companyId: "alpha-company-complete",
        },
    });
    const alphaStartups = await postGraphql<{
        data: {
            Startups: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListStartupsByCompany",
        request,
        url: alphaUrl,
        variables: {
            companyId: "alpha-company-complete",
        },
    });
    const betaJobs = await postGraphql<{
        data: {
            Jobs: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListJobsByCompany",
        request,
        url: betaUrl,
        variables: {
            companyId: "beta-company-ecosystem",
        },
    });
    const betaStartups = await postGraphql<{
        data: {
            Startups: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListStartupsByCompany",
        request,
        url: betaUrl,
        variables: {
            companyId: "beta-company-ecosystem",
        },
    });
    const betaIdentity = await postGraphql<{
        data: {
            Identity: {
                description: string | null;
                name: string;
            } | null;
        };
    }>({
        operationName: "IdentityById",
        request,
        url: betaUrl,
        variables: {
            id: "beta-identity-partial",
        },
    });
    const betaIdentityCompanies = await postGraphql<{
        data: {
            Companies: {
                totalDocs: number;
            };
        };
    }>({
        operationName: "ListCompaniesByIdentity",
        request,
        url: betaUrl,
        variables: {
            identityId: "beta-identity-network",
        },
    });

    expect(alphaProducts.data.Products.docs.find((product) => product.id === "alpha-product-advisory")?.orderable).toBe(
        false,
    );
    expect(alphaProducts.data.Products.docs.find((product) => product.id === "alpha-product-coffee")?.inventory).toBe(
        40,
    );
    expect(betaProducts.data.Products.docs.find((product) => product.id === "beta-product-membership")?.inventory).toBe(
        null,
    );
    expect(alphaJobs.data.Jobs.totalDocs).toBe(0);
    expect(alphaStartups.data.Startups.totalDocs).toBe(0);
    expect(betaJobs.data.Jobs.totalDocs).toBe(3);
    expect(betaStartups.data.Startups.totalDocs).toBe(2);
    expect(betaIdentity.data.Identity?.description).toBe(null);
    expect(betaIdentityCompanies.data.Companies.totalDocs).toBe(2);
});

test("mock servers support subscriptions carts orders and profile updates with stateful responses", async ({ request }) => {
    const initialMe = await postGraphql<{
        data: {
            meUser: {
                user: {
                    id: string;
                    shippingAddress: null;
                    wallets: Array<{
                        address?: string | null;
                        chain?: string | null;
                        provider?: string | null;
                    }>;
                } | null;
            };
        };
    }>({
        operationName: "MeUser",
        request,
        url: alphaUrl,
    });

    expect(initialMe.data.meUser.user?.wallets).toHaveLength(0);
    expect(initialMe.data.meUser.user?.shippingAddress).toBe(null);

    const subscribeCompany = await postGraphql<{
        data: {
            createNotificationSubscription: {
                id: string;
            };
        };
    }>({
        operationName: "SubscribeToCompanyUpdates",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            email: "aria.basic@alpha.mock",
            targetID: "alpha-company-complete",
        },
    });
    const subscribedCompany = await postGraphql<{
        data: {
            Company: {
                isSubscribed: boolean;
            } | null;
        };
    }>({
        operationName: "CompanyById",
        request,
        url: alphaUrl,
        variables: {
            id: "alpha-company-complete",
        },
    });

    expect(subscribedCompany.data.Company?.isSubscribed).toBe(true);

    await postGraphql({
        operationName: "UnsubscribeFromCompanyUpdates",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            subscriptionID: subscribeCompany.data.createNotificationSubscription.id,
        },
    });

    const createCart = await postGraphql<{
        data: {
            createCart: {
                id: string;
                secret: string;
                subtotal: number;
                items: Array<{
                    product: {
                        id: string;
                    } | null;
                }>;
            } | null;
        };
    }>({
        operationName: "CreateCart",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            draft: false,
            data: {
                items: [
                    {
                        product: "alpha-product-advisory",
                        quantity: 1,
                    },
                    {
                        product: "alpha-product-coffee",
                        quantity: 2,
                    },
                ],
            },
        },
    });

    expect(createCart.data.createCart?.subtotal).toBe(48);
    expect(createCart.data.createCart?.items).toHaveLength(1);
    expect(createCart.data.createCart?.items[0].product?.id).toBe("alpha-product-coffee");

    const cartBySecret = await postGraphql<{
        data: {
            Carts: {
                docs: Array<{
                    id: string;
                }>;
            };
        };
    }>({
        operationName: "CartBySecret",
        request,
        url: alphaUrl,
        variables: {
            secret: createCart.data.createCart?.secret,
        },
    });

    expect(cartBySecret.data.Carts.docs[0].id).toBe(createCart.data.createCart?.id);

    const updatedCart = await postGraphql<{
        data: {
            updateCart: {
                subtotal: number;
            } | null;
        };
    }>({
        operationName: "UpdateCart",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            id: createCart.data.createCart?.id,
            draft: false,
            data: {
                items: [
                    {
                        product: "alpha-product-shirt",
                        variant: "alpha-shirt-large",
                        quantity: 2,
                    },
                ],
            },
        },
    });

    expect(updatedCart.data.updateCart?.subtotal).toBe(44);

    const createdOrder = await postGraphql<{
        data: {
            createOrder: {
                amount: number;
                id: string;
                items: Array<{
                    product: {
                        id: string;
                    } | null;
                }>;
            } | null;
        };
    }>({
        operationName: "CreateOrder",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            draft: false,
            data: {
                customerEmail: "aria.basic@alpha.mock",
                items: [
                    {
                        product: "alpha-product-shirt",
                        variant: "alpha-shirt-large",
                        quantity: 2,
                    },
                ],
                shippingAddress: {
                    firstName: "Aria",
                    lastName: "Basic",
                    addressLine1: "101 Market Lane",
                    city: "Prague",
                    postalCode: "11000",
                    country: "CZ",
                },
            },
        },
    });

    expect(createdOrder.data.createOrder?.amount).toBe(44);
    expect(createdOrder.data.createOrder?.items[0].product?.id).toBe("alpha-product-shirt");

    const updatedOrder = await postGraphql<{
        data: {
            updateOrder: {
                payerAddress: string | null;
                status: string;
                transactionHashes: Array<{
                    transactionHash: string;
                }>;
            } | null;
        };
    }>({
        operationName: "UpdateOrder",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            orderId: createdOrder.data.createOrder?.id,
            draft: false,
            data: {
                payerAddress: "TBXSw8fM4jpQkGc6zZjsVABFpVN7UvXPdV",
                transactionHashes: [
                    {
                        product: "alpha-product-shirt",
                        chain: "Tron",
                        transactionHash: "tron-hash-1",
                    },
                ],
            },
        },
    });

    expect(updatedOrder.data.updateOrder?.status).toBe("paid");
    expect(updatedOrder.data.updateOrder?.payerAddress).toBe("TBXSw8fM4jpQkGc6zZjsVABFpVN7UvXPdV");
    expect(updatedOrder.data.updateOrder?.transactionHashes[0].transactionHash).toBe("tron-hash-1");

    const updatedProfile = await postGraphql<{
        data: {
            updateUser: {
                shippingAddress: {
                    firstName: string;
                } | null;
            } | null;
        };
    }>({
        operationName: "UpdateUserById",
        request,
        type: "mutation",
        url: alphaUrl,
        variables: {
            id: "alpha-user-basic",
            data: {
                shippingAddress: {
                    title: "Home",
                    firstName: "Aria",
                    lastName: "Basic",
                    addressLine1: "101 Market Lane",
                    city: "Prague",
                    postalCode: "11000",
                    country: "CZ",
                },
                wallets: [
                    {
                        chain: "Ethereum",
                        provider: "MetaMask",
                        address: "0xa110000000000000000000000000000000000001",
                    },
                ],
            },
        },
    });

    expect(updatedProfile.data.updateUser?.shippingAddress?.firstName).toBe("Aria");

    const updatedMe = await postGraphql<{
        data: {
            meUser: {
                user: {
                    shippingAddress: {
                        firstName: string;
                    } | null;
                    wallets: Array<{
                        address: string;
                    }>;
                } | null;
            };
        };
    }>({
        operationName: "MeUser",
        request,
        url: alphaUrl,
    });
    const updatedProduct = await postGraphql<{
        data: {
            Product: {
                inventory: number | null;
                variants: {
                    docs: Array<{
                        id: string;
                        inventory: number | null;
                    }>;
                };
            } | null;
        };
    }>({
        operationName: "ProductById",
        request,
        url: alphaUrl,
        variables: {
            id: "alpha-product-shirt",
        },
    });

    expect(updatedMe.data.meUser.user?.shippingAddress?.firstName).toBe("Aria");
    expect(updatedMe.data.meUser.user?.wallets).toHaveLength(1);
    expect(updatedProduct.data.Product?.inventory).toBe(13);
    expect(updatedProduct.data.Product?.variants.docs.find((variant) => variant.id === "alpha-shirt-large")?.inventory).toBe(
        4,
    );
});
