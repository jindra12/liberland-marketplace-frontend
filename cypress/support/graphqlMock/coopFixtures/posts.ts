import { image } from "../fixtures/shared";
import { companies } from "./companies";
import { identities } from "./identities";
import { meUser } from "./meUser";
import { Post__Status } from "../../../../src/generated/graphql";
import type { Post } from "../../../../src/generated/graphql";

export const posts: Post[] = [
    {
        id: "coop-post-coop-logistics-roundup",
        title: "Co-op Logistics Roundup",
        slug: "coop-logistics-roundup",
        content: "The co-op server shipped better handoffs, clearer routing, and a more visible publishing flow.",
        _status: Post__Status.Published,
        company: companies[0],
        heroImage: image("coop-post-coop-logistics-roundup", "Co-op Logistics Roundup"),
        meta: {
            title: "Co-op Logistics Roundup",
            description: "Weekly logistics changes from the co-op server",
            image: image("coop-post-coop-logistics-roundup-meta", "Co-op Logistics Roundup meta"),
        },
        categories: [{ id: "coop-category-announcements", title: "Announcements", slug: "announcements", createdBy: meUser.user }],
        populatedAuthors: [{ id: identities[0].id, name: identities[0].name }],
        createdBy: meUser.user,
        hasLiked: false,
        likeCount: 9,
        publishedAt: "2025-03-05T09:00:00.000Z",
        createdAt: "2025-03-04T09:00:00.000Z",
        updatedAt: "2025-03-05T09:15:00.000Z",
        contentRankScore: 170,
    },
    {
        id: "coop-post-field-notes",
        title: "Field Notes",
        slug: "field-notes",
        content: "Field notes focused on smaller operational improvements and a calmer publishing cadence.",
        _status: Post__Status.Published,
        company: companies[1],
        heroImage: image("coop-post-field-notes", "Field Notes"),
        meta: {
            title: "Field Notes",
            description: "A lighter note from the field",
            image: image("coop-post-field-notes-meta", "Field Notes meta"),
        },
        categories: [{ id: "coop-category-field-notes", title: "Field Notes", slug: "field-notes", createdBy: meUser.user }],
        populatedAuthors: [{ id: identities[1].id, name: identities[1].name }],
        createdBy: meUser.user,
        hasLiked: true,
        likeCount: 4,
        publishedAt: "2025-03-06T09:00:00.000Z",
        createdAt: "2025-03-05T09:00:00.000Z",
        updatedAt: "2025-03-06T09:15:00.000Z",
        contentRankScore: 80,
    },
];
