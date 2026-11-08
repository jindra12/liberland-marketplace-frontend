import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { withBackend } from "../publicDiscoveryChecks";
import { addSyndicatedServer } from "../../../src/mcp/session";

export const registerFixtureSyndications = async (authorization: string, servers: string[], issuer: string) => {
    await withBackend(
        async () => {
            await Promise.all(servers.map((serverUrl) => addSyndicatedServer(authorization, serverUrl, issuer)));
        },
        async () => Response.json({ sub: "fixture-user" }),
    );
};

export const withGatewayClient = async (
    run: (client: Client) => Promise<void>,
    authorization?: string,
    selectedServerUrl?: string,
) => {
    const { createNswapMcpServer } = await import("../../../src/mcp/server");
    const server = createNswapMcpServer(authorization, selectedServerUrl, "protocol-security-fixture");
    const client = new Client({ name: "protocol-security-fixture", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
        await server.connect(serverTransport);
        await client.connect(clientTransport);
        await run(client);
    } finally {
        await client.close();
        await server.close();
    }
};
