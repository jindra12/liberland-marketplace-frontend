import { MARKETPLACE_SKILLS } from "./skills/constants";
import { buildSkillText, buildSkillsIndex } from "./skills/utils";
import { buildAuthGuide } from "./auth/utils";
import {
    buildAiCatalog,
    buildApiCatalog,
    buildMcpServerCard,
    buildRobotsText,
} from "./catalogs/utils";
import { buildOpenApiDocument } from "./openapi/utils";
import { buildSearchAgentCard } from "../a2a/utils";
import { AgentCard } from "@a2a-js/sdk";

export const findDiscoveryDocument = (path: string, serverUrl?: string) => {
    switch (path) {
        case "robots.txt":
            return { type: "text/plain", body: buildRobotsText() };
        case "auth.md":
            return { type: "text/markdown", body: buildAuthGuide(serverUrl) };
        case "auth.txt":
            return { type: "text/plain", body: buildAuthGuide(serverUrl) };
        case "openapi.json":
            return { type: "application/json", body: JSON.stringify(buildOpenApiDocument()) };
        case "api-catalog":
            return { type: "application/linkset+json", body: JSON.stringify(buildApiCatalog()) };
        case "ard.json":
            return { type: "application/json", body: JSON.stringify(buildAiCatalog()) };
        case "ai-catalog.json":
            return { type: "application/ai-catalog+json", body: JSON.stringify(buildAiCatalog()) };
        case "mcp.json":
        case "mcp/server-card.json":
            return { type: "application/json", body: JSON.stringify(buildMcpServerCard()) };
        case "agent-card.json":
            return { type: "application/json", body: JSON.stringify(AgentCard.toJSON(buildSearchAgentCard())) };
        case "agent-skills/index.json":
            return { type: "application/json", body: JSON.stringify(buildSkillsIndex()) };
        default: {
            const skill = MARKETPLACE_SKILLS.find((candidate) => path === `agent-skills/${candidate.name}/SKILL.md`);
            return skill ? { type: "text/markdown", body: buildSkillText(skill) } : undefined;
        }
    }
};
