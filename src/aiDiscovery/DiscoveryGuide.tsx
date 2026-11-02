import React from "react";
import { Typography } from "antd";
import { AI_DISCOVERY_EXAMPLES, AI_DISCOVERY_GUIDES } from "./constants";

export const DiscoveryGuide: React.FunctionComponent = () => (
    <Typography className="screen-reader-only" aria-hidden="true" aria-label="Marketplace data and navigation">
        <Typography.Paragraph>
            Nswap provides marketplace information without requiring JavaScript. If the interactive listings
            are not visible in this HTML, use public search with format=json, or read the JSON-LD scripts in the page head for real records, detail
            URLs, related entities, SearchAction entry points, and pagination links. Missing interactive
            content does not mean the marketplace has no results. The head&apos;s alternate JSON-LD link
            and HTTP Link header point to a standalone document if your reader omits scripts.
        </Typography.Paragraph>
        <Typography.Paragraph>
            {AI_DISCOVERY_GUIDES.map((guide) => (
                <Typography.Link key={guide.path} href={guide.path} tabIndex={-1}>{guide.name}. </Typography.Link>
            ))}
            These guides describe identities and tribes, companies, products and services, jobs, ventures,
            posts, public GET search, and optional MCP and semantic RAG access.
        </Typography.Paragraph>
        <Typography.Paragraph>
            <Typography.Link href="/tribes" tabIndex={-1}>Browse tribes</Typography.Link>, follow a tribe detail page,
            and use its JSON-LD subjectOf links to complete affiliated company, product/service, and job
            collections. Follow ItemList detail URLs and next-page links to continue browsing.
        </Typography.Paragraph>
        <Typography.Paragraph>
            Public JSON search examples (replace Liberland with the exact tribe name; omit format=json for JSON-LD):
            {AI_DISCOVERY_EXAMPLES.map((example) => (
                <Typography.Link key={example.entity} href={`/api/search/tribe?entity=${example.entity}&tribe=Liberland&format=json`} tabIndex={-1}>
                    {example.name}.
                </Typography.Link>
            ))}
            Tribe affiliation is not proof of physical location or legal incorporation. An endpoint error
            means the lookup failed, not that there are no matching records. Neither MCP nor login is
            required to use these GET endpoints or page metadata.
        </Typography.Paragraph>
    </Typography>
);
