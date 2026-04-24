import { companies } from "./companies";
import { identities } from "./identities";
import { jobs } from "./jobs";
import { startups } from "./startups";
import { meUser } from "./meUser";
import { Comment_ReplyPost_RelationTo } from "../../../../src/generated/graphql";
import type { Comment } from "../../../../src/generated/graphql";

export const comments: Comment[] = [
    {
        id: "coop-comment-company-helix",
        content: "Helix Harbor keeps things moving.",
        company: companies[0],
        createdBy: meUser.user,
        replyPost: { relationTo: Comment_ReplyPost_RelationTo.Companies, value: companies[0] },
        replyPostRelationTo: "companies",
        replyPostValue: companies[0].id,
        serverUrl: identities[0].serverURL,
        createdAt: "2025-03-03T10:00:00.000Z",
        updatedAt: "2025-03-03T10:00:00.000Z",
    },
    {
        id: "coop-comment-job-dock-foreman",
        content: "Dock Foreman keeps Helix Harbor moving.",
        company: companies[0],
        createdBy: meUser.user,
        replyPost: { relationTo: Comment_ReplyPost_RelationTo.Jobs, value: jobs[0] },
        replyPostRelationTo: "jobs",
        replyPostValue: jobs[0].id,
        serverUrl: identities[1].serverURL,
        createdAt: "2025-03-03T11:00:00.000Z",
        updatedAt: "2025-03-03T11:00:00.000Z",
    },
    {
        id: "coop-comment-startup-reef",
        content: "Reef Signal is worth watching.",
        company: companies[0],
        createdBy: meUser.user,
        replyPost: { relationTo: Comment_ReplyPost_RelationTo.Startups, value: startups[0] },
        replyPostRelationTo: "startups",
        replyPostValue: startups[0].id,
        serverUrl: identities[0].serverURL,
        createdAt: "2025-03-04T10:00:00.000Z",
        updatedAt: "2025-03-04T10:00:00.000Z",
    },
];
