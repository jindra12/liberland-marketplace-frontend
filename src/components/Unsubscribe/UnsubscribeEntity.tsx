import * as React from "react";

import type { UnsubscribeEntityProps } from "./types";
import { UnsubscribeEntityConfirmState } from "./UnsubscribeEntityConfirmState";
import { UnsubscribeEntityLoadingState } from "./UnsubscribeEntityLoadingState";
import { UnsubscribeEntityLookupErrorState } from "./UnsubscribeEntityLookupErrorState";
import { UnsubscribeEntityMissingState } from "./UnsubscribeEntityMissingState";
import { toUnsubscribeLookupErrorMessage } from "./utils";

export const UnsubscribeEntity = <TData,>(props: UnsubscribeEntityProps<TData>) => {
    const entity = props.query.data ? props.resolveEntity(props.query.data) : null;
    const isLoading = props.query.isLoading || (props.query.isFetching && !props.query.data);

    if (isLoading) {
        return <UnsubscribeEntityLoadingState />;
    }

    if (props.query.error) {
        return (
            <UnsubscribeEntityLookupErrorState
                errorMessage={toUnsubscribeLookupErrorMessage(props.query.error)}
                onRetry={async () => {
                    await props.query.refetch({
                        throwOnError: false,
                    });
                }}
            />
        );
    }

    if (!entity) {
        return <UnsubscribeEntityMissingState />;
    }

    return <UnsubscribeEntityConfirmState entity={entity} params={props.params} />;
};
