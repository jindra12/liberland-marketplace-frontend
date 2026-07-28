import * as React from "react";

import { SearchScope } from "../types";

import { CompaniesSearch } from "./search/CompaniesSearch";
import { IdentitiesSearch } from "./search/IdentitiesSearch";
import { JobSearch } from "./search/JobSearch";
import { PostsSearch } from "./search/PostsSearch";
import { ProductsServicesSearch } from "./search/ProductsServicesSearch";
import { StartupsSearch } from "./search/StartupsSearch";
import type { RelatedTargetSelection } from "./shared/post/types";

export interface SearchContainerProps {
    scope: SearchScope;
    onClose: () => void;
    onSelect?: (value: RelatedTargetSelection) => void;
}

export const SearchContainer: React.FunctionComponent<SearchContainerProps> = (props) => {
    switch (props.scope) {
        case "companies":
            return <CompaniesSearch onClose={props.onClose} onSelect={props.onSelect} />;
        case "identities":
            return <IdentitiesSearch onClose={props.onClose} onSelect={props.onSelect} />;
        case "jobs":
            return <JobSearch onClose={props.onClose} onSelect={props.onSelect} />;
        case "posts":
            return <PostsSearch onClose={props.onClose} onSelect={props.onSelect} />;
        case "products":
            return <ProductsServicesSearch onClose={props.onClose} onSelect={props.onSelect} />;
        case "startups":
            return <StartupsSearch onClose={props.onClose} onSelect={props.onSelect} />;
    }
};
