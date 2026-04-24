import { image } from "../fixtures/shared";
import { companies } from "./companies";
import { identities } from "./identities";
import { meUser } from "./meUser";
import { Post__Status } from "../../../../src/generated/graphql";
import type { Post } from "../../../../src/generated/graphql";

export const posts: Post[] = [
    {
        id: "guest-post-guest-market-notes",
        title: "Guest Market Notes",
        slug: "guest-market-notes",
        content: "Guest market notes focused on simpler publishing and a tighter product overview.",
        _status: Post__Status.Published,
        company: companies[0],
        heroImage: image("guest-post-guest-market-notes", "Guest Market Notes"),
        meta: {
            title: "Guest Market Notes",
            description: "A small note from the guest server",
            image: image("guest-post-guest-market-notes-meta", "Guest Market Notes meta"),
        },
        categories: [{ id: "guest-category-notes", title: "Notes", slug: "notes", createdBy: meUser.user }],
        populatedAuthors: [{ id: identities[0].id, name: identities[0].name }],
        createdBy: meUser.user,
        hasLiked: false,
        likeCount: 2,
        publishedAt: "2025-03-07T09:00:00.000Z",
        createdAt: "2025-03-06T09:00:00.000Z",
        updatedAt: "2025-03-07T09:15:00.000Z",
        contentRankScore: 60,
    },
];
