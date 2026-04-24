import type {
    ListPostsQuery,
    Post_RelatedPosts_RelationTo,
    Post_RelatedPostsRelationshipInputRelationTo,
    Post_RelatedPosts_Relationship,
} from "../../../generated/graphql";

export type PostDoc = NonNullable<NonNullable<ListPostsQuery["Posts"]>["docs"]>[number];
export type PostRelatedTarget = NonNullable<PostDoc["relatedPosts"]>[number];

export type RelatedTargetSelection = {
    relationTo: Post_RelatedPosts_RelationTo;
    value: string;
    label: string;
};

export type RelatedTargetInputSelection = {
    relationTo: Post_RelatedPostsRelationshipInputRelationTo;
    value: string;
};

export type RelatedTargetDoc = NonNullable<PostRelatedTarget["value"]>;

export type RelatedTargetMatch = NonNullable<Post_RelatedPosts_Relationship["value"]>;
