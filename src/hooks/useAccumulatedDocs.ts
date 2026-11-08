import { useState } from "react";
import { isEqual } from "lodash-es";
import { getSourceQualifiedEntityKey } from "../components/query/utils";
import type { SourceQualifiedEntity } from "../components/query/types";

/**
 * Accumulates paginated query docs across page changes.
 * When page resets to 1, accumulated items reset to the new docs.
 * Deduplicates by source and ID; independent backends may reuse the same ID.
 */
export const useAccumulatedDocs = <T extends SourceQualifiedEntity>(
    docs: T[] | undefined | null,
    page: number,
): T[] => {
    const [snapshot, setSnapshot] = useState({ page, docs: docs || [] });
    const accumulated =
        page <= 1
            ? docs || []
            : Array.from(
                  new Map(
                      [...snapshot.docs, ...(docs || [])].map((doc) => [getSourceQualifiedEntityKey(doc), doc]),
                  ).values(),
              );

    // Compare contents because callers may map query results on every render.
    if (snapshot.page !== page || !isEqual(snapshot.docs, accumulated)) {
        setSnapshot({ page, docs: accumulated });
    }

    return accumulated;
};
