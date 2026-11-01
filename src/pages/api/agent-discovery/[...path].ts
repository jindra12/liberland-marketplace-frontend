/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import Negotiator from "negotiator";
import { findDiscoveryDocument } from "../../../server/agentDiscovery/utils";
import { getIssuerDiscoveryUrl } from "../../../server/agentDiscovery/auth/utils";
import { fetchPoppyDiscovery } from "../../../server/agentDiscovery/poppy/utils";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "MCP-Protocol-Version, A2A-Version, A2A-Extensions");
    if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD, OPTIONS");
        response.status(405).json({ error: "Use GET or HEAD for public discovery documents." });
        return;
    }
    const path = Array.isArray(request.query.path) ? request.query.path.join("/") : request.query.path || "";
    const serverUrl = typeof request.query.serverUrl === "string" ? request.query.serverUrl : undefined;
    try {
        if (path === "oauth-authorization-server" || path === "openid-configuration") {
            response.setHeader("Cache-Control", "no-store");
            response.redirect(302, getIssuerDiscoveryUrl(path, serverUrl));
            return;
        }
        const document =
            path === "poppy.json"
                ? { type: "application/json", body: JSON.stringify((await fetchPoppyDiscovery()).document) }
                : findDiscoveryDocument(path, serverUrl);
        if (!document) {
            response.status(404).json({ error: "No such agent discovery document." });
            return;
        }
        const type = document.type.endsWith("+json")
            ? request.query.format === "json"
                ? "application/json"
                : new Negotiator(request).mediaType([document.type, "application/json"]) || document.type
            : document.type;
        response.setHeader("Vary", "Accept");
        response.setHeader("Content-Type", `${type}; charset=utf-8`);
        response.setHeader("Cache-Control", "public, max-age=3600");
        response.setHeader("Content-Length", Buffer.byteLength(document.body));
        if (request.method === "HEAD") {
            response.status(200).end();
            return;
        }
        response.status(200).send(document.body);
    } catch (error) {
        console.error("Agent discovery failed", error);
        response.setHeader("Cache-Control", "no-store");
        response
            .status(path === "poppy.json" ? 502 : 400)
            .json({
                error:
                    path === "poppy.json"
                        ? "The configured backend's Poppy discovery is unavailable or unverified."
                        : "Invalid discovery configuration or backend URL.",
            });
    }
};

export default handler;
