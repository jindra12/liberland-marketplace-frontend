import { createHash } from "node:crypto";
import { buildSiteUrl } from "../../../siteUrl";
import { MARKETPLACE_SKILLS } from "./constants";

export const buildSkillText = (skill: (typeof MARKETPLACE_SKILLS)[number]): string =>
    [
        "---",
        `name: ${skill.name}`,
        `description: ${skill.description}`,
        "---",
        "",
        `# ${skill.name}`,
        "",
        ...skill.instructions.map((instruction) => `- ${instruction}\n`),
    ].join("\n");

export const buildSkillsIndex = () => ({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: MARKETPLACE_SKILLS.map((skill) => ({
        name: skill.name,
        description: skill.description,
        type: "skill-md",
        url: buildSiteUrl(`/.well-known/agent-skills/${skill.name}/SKILL.md`),
        digest: `sha256:${createHash("sha256").update(buildSkillText(skill), "utf8").digest("hex")}`,
    })),
});
