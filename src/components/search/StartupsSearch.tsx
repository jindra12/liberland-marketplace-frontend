import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";
import { useSearchStartupsQuery } from "../../generated/graphql";
import { getImage } from "../../utils";

export interface StartupsSearchProps {
    onClose: () => void;
}

export const StartupsSearch: React.FunctionComponent<StartupsSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const startups = useSearchStartupsQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!startups.isFetched) {
            setOptions([]);
        } else if (startups.data) {
            setOptions(
                startups
                    .data
                    .Searches
                    ?.docs
                    .map(({ title, doc }) => ({ value: (doc.value as DocType)?.id || "", label: title, image: getImage(doc.value as DocType) })) || []
            );
        }
    }, [startups.isFetched, startups.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => { navigate(`/startups/${value}`); props.onClose(); }}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={startups.isLoading}
        />
    );
};
