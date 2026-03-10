import { useEffect, useState } from "react";

/**
 * Accumulates paginated query docs across page changes.
 * When page resets to 1, accumulated items reset to the new docs.
 * Deduplicates by `id` to handle edge cases.
 */
export function useAccumulatedDocs<T extends { id: string }>(
    docs: T[] | undefined | null,
    page: number,
): T[] {
    const [accumulated, setAccumulated] = useState<T[]>([]);

    useEffect(() => {
        if (!docs?.length) return;

        setAccumulated((prev) => {
            if (page <= 1) return docs;
            const existingIds = new Set(prev.map((d) => d.id));
            const newDocs = docs.filter((d) => !existingIds.has(d.id));
            return newDocs.length > 0 ? [...prev, ...newDocs] : prev;
        });
    }, [docs, page]);

    return accumulated;
}
