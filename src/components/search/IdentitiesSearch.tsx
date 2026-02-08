import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";
import { useSearchIdentitiesQuery } from "../../generated/graphql";
import { getImage } from "../../utils";

export interface IdentitiesSearchProps {
    onClose: () => void;
}

export const IdentitiesSearch: React.FunctionComponent<IdentitiesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const identities = useSearchIdentitiesQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!identities.isFetched) {
            setOptions([]);
        } else if (identities.data) {
            setOptions(
                identities
                    .data
                    .Searches
                    ?.docs
                    .map(({ id, title, doc }) => ({ value: id, label: title, image: getImage(doc.value as DocType) })) || []
            );
        }
    }, [identities.isFetched, identities.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/identities/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={identities.isLoading}
        />
    );
};