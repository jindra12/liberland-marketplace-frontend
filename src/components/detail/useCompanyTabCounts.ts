import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useListJobsByCompanyQuery,
    useListProductsByCompanyQuery,
    useListStartupsByCompanyQuery,
    useListCommentsByTargetQuery,
} from "../../generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../constants";

export function useCompanyTabCounts(companyId: string | undefined) {
    const enabled = !!companyId;

    const jobsQuery = useListJobsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });
    const productsQuery = useListProductsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });
    const venturesQuery = useListStartupsByCompanyQuery({ companyId: companyId!, limit: 1 }, { enabled });

    const commentsRelation = COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies];
    const commentsQuery = useListCommentsByTargetQuery(
        { targetId: companyId!, relationTo: commentsRelation, limit: 1 },
        { enabled },
    );

    return {
        jobs: jobsQuery.data?.Jobs?.totalDocs ?? 0,
        products: productsQuery.data?.Products?.totalDocs ?? 0,
        ventures: venturesQuery.data?.Startups?.totalDocs ?? 0,
        comments: commentsQuery.data?.Comments?.totalDocs ?? 0,
    };
}
