import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { SearchOption } from "../../types";
import { useSearchIdentitiesQuery } from "../../generated/graphql";

export interface IdentitiesSearchProps {
    onClose: () => void;
}

export const IdentitiesSearch: React.FunctionComponent<IdentitiesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const jobs = useSearchIdentitiesQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });
    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/identities/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={jobs.isLoading}
        />
    );
};