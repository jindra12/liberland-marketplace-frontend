import React from "react";
import { AppHead } from "./AppHead";
import { Dynamic } from "./Dynamic";
import type { CollectionPageProps } from "./server/types";

export const CollectionPage: React.FunctionComponent<CollectionPageProps> = (props) => {
    return (
        <>
            <AppHead
                jsonLdAlternateUrl={props.jsonLdAlternateUrl}
                title={props.title}
                description={props.description}
                canonicalPath={props.canonicalPath}
                jsonLd={props.jsonLd}
                extraMetaTags={props.extraMetaTags}
                extraLinks={props.extraLinks}
            />
            <Dynamic />
        </>
    );
};
