import { ListPostsDocument, useListPostsQuery } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListPage } from "../../hooks/useListPage";
import { useEndpointContext } from "../EndpointContext";
import {
    enhancedQueryFactory,
    useListCompaniesQuery,
    useListIdentitiesQuery,
    useListJobsQuery,
    useListProductsQuery,
    useListStartupsQuery,
} from "../hooks";

import { MARKET_ACCORDION_POSTS_QUERY_LIMIT } from "./constants";
import { getPopularPosts } from "./utils";

const usePopularPostsQuery = enhancedQueryFactory(useListPostsQuery, ListPostsDocument, false);

export const useMarketAccordion = () => {
    const { page, setPage } = useListPage("homepage-popular-posts");
    const companies = useListCompaniesQuery({ page: 1, limit: 7 });
    const jobs = useListJobsQuery({ page: 1, limit: 7 });
    const products = useListProductsQuery({ page: 1, limit: 7 });
    const ventures = useListStartupsQuery({ page: 1, limit: 7 });
    const tribes = useListIdentitiesQuery({ page: 1, limit: 7 });
    const posts = usePopularPostsQuery({ page, limit: MARKET_ACCORDION_POSTS_QUERY_LIMIT, sort: "-likeCount" });
    const postItems = useAccumulatedDocs(posts.data?.Posts?.docs, page);
    const { urls } = useEndpointContext();

    return {
        companies,
        jobs,
        products,
        ventures,
        tribes,
        posts,
        postItems: getPopularPosts(postItems),
        hasSyndication: urls.length > 1,
        loadMorePosts: () => setPage(page + 1),
    };
};
