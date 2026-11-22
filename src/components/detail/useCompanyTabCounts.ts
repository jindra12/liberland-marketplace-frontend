import { Comment_ReplyPostRelationshipInputRelationTo } from "../../generated/graphql";
import {
    useListJobsByCompanyQuery,
    useListPostsByCompanyQuery,
    useListProductsByCompanyQuery,
    useListStartupsByCompanyQuery,
    useListCommentsByTargetQuery,
} from "../hooks";
import { COMMENT_RELATION_TO_QUERY_RELATION, ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../constants";

export const useCompanyTabCounts = (companyId: string | undefined, serverUrl: string) => {
    const enabled = Boolean(companyId);

    const jobsQuery = useListJobsByCompanyQuery({ companyId: companyId!, limit: 3, url: serverUrl }, { enabled });
    const postsQuery = useListPostsByCompanyQuery({ companyId: companyId!, limit: 1, url: serverUrl }, { enabled });
    const productsQuery = useListProductsByCompanyQuery(
        { companyId: companyId!, limit: 3, url: serverUrl },
        { enabled },
    );
    const startupsQuery = useListStartupsByCompanyQuery(
        { companyId: companyId!, limit: 1, url: serverUrl },
        { enabled },
    );

    const commentsRelation = COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies];
    const commentsQuery = useListCommentsByTargetQuery(
        { targetId: companyId!, relationTo: commentsRelation, limit: ENTITY_COMMENTS_DEFAULT_LIMIT, url: serverUrl },
        { enabled },
    );

    return {
        jobsQuery,
        productsQuery,
        jobs: jobsQuery.data?.Jobs?.totalDocs ?? 0,
        posts: postsQuery.data?.Posts?.totalDocs ?? 0,
        products: productsQuery.data?.Products?.totalDocs ?? 0,
        startups: startupsQuery.data?.Startups?.totalDocs ?? 0,
        comments: commentsQuery.data?.Comments?.totalDocs ?? 0,
    };
};
