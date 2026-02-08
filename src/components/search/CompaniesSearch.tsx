import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { SearchOption } from "../../types";
import { useSearchCompaniesQuery } from "../../generated/graphql";

export interface CompaniesSearchProps {
    onClose: () => void;
}

export const CompaniesSearch: React.FunctionComponent<CompaniesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const jobs = useSearchCompaniesQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });
    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/companies/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={jobs.isLoading}
        />
    );
};