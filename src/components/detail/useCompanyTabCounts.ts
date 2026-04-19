import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useListJobsByCompanyQuery,
    useListPostsByCompanyQuery,
    useListProductsByCompanyQuery,
    useListStartupsByCompanyQuery,
    useListCommentsByTargetQuery,
} from "../../generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION, ENTITY_COMMENTS_DEFAULT_LIMIT } from "../../constants";

export const useCompanyTabCounts = (companyId: string | undefined) => {
    const enabled = !!companyId;

    const jobsQuery = useListJobsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });
    const postsQuery = useListPostsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });
    const productsQuery = useListProductsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });
    const startupsQuery = useListStartupsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });

    const commentsRelation = COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies];
    const commentsQuery = useListCommentsByTargetQuery(
        { targetId: companyId!, relationTo: commentsRelation, limit: ENTITY_COMMENTS_DEFAULT_LIMIT },
        { enabled },
    );

    return {
        jobs: jobsQuery.data?.Jobs?.totalDocs ?? 0,
        posts: postsQuery.data?.Posts?.totalDocs ?? 0,
        products: productsQuery.data?.Products?.totalDocs ?? 0,
        startups: startupsQuery.data?.Startups?.totalDocs ?? 0,
        comments: commentsQuery.data?.Comments?.totalDocs ?? 0,
    };
}
