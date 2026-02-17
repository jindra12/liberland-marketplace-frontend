import {
    Comment_ReplyPostRelationshipInputRelationTo,
    Comment_ReplyPost_Relation_RelationTo,
} from "./generated/graphql";

export const ENTITY_COMMENTS_DEFAULT_TITLE = "Comments";
export const ENTITY_COMMENTS_DEFAULT_LIMIT = 100;
export const ENTITY_COMMENTS_DEFAULT_PLACEHOLDER = "Write your comment...";

export const ENTITY_COMMENTS_DEFAULT_AVATAR_URL = "/logo192.png";
export const ENTITY_COMMENTS_ANONYMOUS_USER_ID = "__anonymous_writer__";
export const ENTITY_COMMENTS_ANONYMOUS_NAME = "Anonymous";
export const ENTITY_COMMENTS_USER_FALLBACK_NAME = "User";
export const ENTITY_COMMENTS_AUTHORIZED_FALLBACK_ID = "authorized-user";
export const ENTITY_COMMENTS_AUTHORIZED_FALLBACK_NAME = "Authorized user";

export const COMMENT_RELATION_TO_QUERY_RELATION: Record<
    Comment_ReplyPostRelationshipInputRelationTo,
    Comment_ReplyPost_Relation_RelationTo
> = {
    [Comment_ReplyPostRelationshipInputRelationTo.Companies]: Comment_ReplyPost_Relation_RelationTo.Companies,
    [Comment_ReplyPostRelationshipInputRelationTo.Identities]: Comment_ReplyPost_Relation_RelationTo.Identities,
    [Comment_ReplyPostRelationshipInputRelationTo.Jobs]: Comment_ReplyPost_Relation_RelationTo.Jobs,
    [Comment_ReplyPostRelationshipInputRelationTo.Products]: Comment_ReplyPost_Relation_RelationTo.Products,
};
