import { useListPage } from "../../hooks/useListPage";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useDislikeIdentityMutation, useLikeIdentityMutation, useListIdentitiesQuery } from "../hooks";

export const useIdentityListModel = () => {
    const { page, setPage } = useListPage();
    const query = useListIdentitiesQuery({ limit: 20, page });
    const items = useAccumulatedDocs(query.data?.Identities?.docs, page);
    const likeMutation = useLikeIdentityMutation();
    const dislikeMutation = useDislikeIdentityMutation();
    return { query, items, likeMutation, dislikeMutation, loadMore: () => setPage(page + 1) };
};
