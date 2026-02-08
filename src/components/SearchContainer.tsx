import * as React from "react";
import { SearchScope } from "../types";
import { CompaniesSearch } from "./search/CompaniesSearch";
import { IdentitiesSearch } from "./search/IdentitiesSearch";
import { JobSearch } from "./search/JobSearch";
import { ProductsServicesSearch } from "./search/ProductsServicesSearch";

export interface SearchContainerProps {
    scope: SearchScope;
    onClose: () => void;
}

export const SearchContainer: React.FunctionComponent<SearchContainerProps> = (props) => {
    switch (props.scope) {
        case "companies":
            return <CompaniesSearch onClose={props.onClose} />;
        case "identities":
            return <IdentitiesSearch onClose={props.onClose} />
        case "jobs":
            return <JobSearch onClose={props.onClose} />
        case "products":
            return <ProductsServicesSearch onClose={props.onClose} />
    }
};
