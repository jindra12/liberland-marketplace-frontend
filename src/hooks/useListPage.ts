import { useState } from "react";
import { useEndpointContext } from "../components/EndpointContext";
import { useSortContent } from "../components/SortContentBySelect/useSortContent";

export const useListPage = (scope?: string, serverUrl?: string | null) => {
    const { enabled } = useEndpointContext();
    const [sort] = useSortContent();
    const key = JSON.stringify([scope, serverUrl ? [serverUrl] : enabled, sort]);
    const [cursor, setCursor] = useState({ key, page: 1 });
    if (cursor.key !== key) {
        setCursor({ key, page: 1 });
    }
    return {
        page: cursor.key === key ? cursor.page : 1,
        setPage: (page: number) => setCursor({ key, page }),
    };
};
