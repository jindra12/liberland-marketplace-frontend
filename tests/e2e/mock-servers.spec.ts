import { expect, test } from "@playwright/test";

import { SYNDICATION_SERVERS } from "./fixtures/constants";

test("syndication mock servers respond on separate ports", async ({ request }) => {
    const alpha = await request.post(`${SYNDICATION_SERVERS[0].url}/api/graphql`, {
        data: {
            operationName: "ListPublishedSyndicationUrls",
        },
    });
    const beta = await request.post(`${SYNDICATION_SERVERS[1].url}/api/graphql`, {
        data: {
            operationName: "ListPublishedSyndicationUrls",
        },
    });

    const alphaJson = (await alpha.json()) as {
        data: {
            Syndications: {
                docs: Array<{ name: string }>;
            };
        };
    };
    const betaJson = (await beta.json()) as {
        data: {
            Syndications: {
                docs: Array<{ name: string }>;
            };
        };
    };

    expect(alphaJson.data.Syndications.docs[0].name).toBe("Alpha Mock Market");
    expect(betaJson.data.Syndications.docs[0].name).toBe("Beta Mock Market");
});
