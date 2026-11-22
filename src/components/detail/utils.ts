import uniqBy from "lodash-es/uniqBy";

import { getSourceQualifiedEntityKey } from "../query/utils";
import type { SourceQualifiedEntity } from "../query/types";

/** Preserve curated order and keep identifiers scoped to their source backend. */
export const combineUniqueById = <TItem extends SourceQualifiedEntity & { id: string }>(
    firstItems: TItem[],
    secondItems: TItem[],
    limit: number,
    excluded?: SourceQualifiedEntity,
) =>
    uniqBy([...firstItems, ...secondItems], getSourceQualifiedEntityKey)
        .filter((item) => !excluded || getSourceQualifiedEntityKey(item) !== getSourceQualifiedEntityKey(excluded))
        .slice(0, limit);
