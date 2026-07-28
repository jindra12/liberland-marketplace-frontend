export const combineUniqueById = <TItem extends { id: string }>(
    firstItems: TItem[],
    secondItems: TItem[],
    limit: number,
) => {
    const merged: TItem[] = [];
    const seen = new Set<string>();

    [firstItems, secondItems].forEach((items) => {
        items.forEach((item) => {
            if (merged.length >= limit || seen.has(item.id)) {
                return;
            }

            seen.add(item.id);
            merged.push(item);
        });
    });

    return merged;
};
