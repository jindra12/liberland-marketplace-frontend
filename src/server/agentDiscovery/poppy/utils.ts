import { SITE_URL } from "../../../siteUrl";
import { publicBackendFetch } from "../../security/utils";
import { getDiscoveryBackend, getIssuerDiscoveryUrl } from "../auth/utils";

const loadPoppyDiscovery = async () => {
    const { listsResource, parseDiscoveryDocument, parseOAuthServerMetadata } = await import("@datalayer/personal-agent-protocol");
    const backend = getDiscoveryBackend();
    const domain = new URL(SITE_URL).hostname;
    const url = new URL(`${backend}/.well-known/poppy.json`);
    url.searchParams.set("domain", domain);
    const response = await publicBackendFetch(url);
    if (!response.ok) {
        throw new Error(`The configured backend rejected Poppy discovery (${response.status}).`);
    }
    const document = parseDiscoveryDocument(await response.json());
    if (document.organization.domain !== domain || document.auth?.issuer !== backend) {
        throw new Error("The backend did not confirm this site's Poppy identity.");
    }
    const issuerResponse = await publicBackendFetch(getIssuerDiscoveryUrl("oauth-authorization-server", backend));
    if (!issuerResponse.ok) {
        throw new Error("Poppy issuer discovery failed.");
    }
    const issuer = parseOAuthServerMetadata(await issuerResponse.json());
    if (issuer.issuer !== backend || !listsResource(issuer, domain)) {
        throw new Error("The issuer does not authorize this frontend domain.");
    }
    return { document, issuer };
};

const documents = new Map<string, { expiresAt: number; value: ReturnType<typeof loadPoppyDiscovery> }>();

export const fetchPoppyDiscovery = async () => {
    const key = `${SITE_URL}|${getDiscoveryBackend()}`;
    const cached = documents.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }
    documents.clear();
    const value = loadPoppyDiscovery();
    documents.set(key, { expiresAt: Date.now() + 3600000, value });
    try {
        return await value;
    } catch (error) {
        documents.delete(key);
        throw error;
    }
};

export const fetchPoppyDomainMetadata = async () => {
    const { issuer } = await fetchPoppyDiscovery();
    return {
        resource: new URL(SITE_URL).origin,
        authorization_servers: [issuer.issuer],
        scopes_supported: issuer.scopes_supported || [],
        bearer_methods_supported: ["header"],
        resource_documentation: new URL("/auth.txt", SITE_URL).href,
    };
};
