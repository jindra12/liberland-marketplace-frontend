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
    const companies = useSearchCompaniesQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!companies.isFetched) {
            setOptions([]);
        } else if (companies.data) {
            setOptions(companies.data.Searches?.docs.map(({ id, title }) => ({ value: id, label: title })) || [])
        }
    }, [companies.isFetched, companies.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/companies/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={companies.isLoading}
        />
    );
};