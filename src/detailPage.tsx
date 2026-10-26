import React from "react";
import { AppHead } from "./AppHead";
import { Dynamic } from "./Dynamic";
import type { DetailPageMetadata } from "./detailMetadata/shared";

export const DetailPage: React.FunctionComponent<DetailPageMetadata> = (props) => {
    return (
        <>
            <AppHead
                jsonLdAlternateUrl={props.jsonLdAlternateUrl}
                title={props.title}
                description={props.description}
                canonicalPath={props.canonicalPath}
                jsonLd={props.jsonLd}
                imageUrl={props.imageUrl}
                imageAlt={props.imageAlt}
                ogType={props.ogType}
                extraMetaTags={props.extraMetaTags}
            />
            <Dynamic />
        </>
    );
};
