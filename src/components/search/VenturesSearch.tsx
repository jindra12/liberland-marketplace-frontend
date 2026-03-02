import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";
import { useSearchStartupsQuery } from "../../generated/graphql";
import { getImage } from "../../utils";

export interface VenturesSearchProps {
    onClose: () => void;
}

export const VenturesSearch: React.FunctionComponent<VenturesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const ventures = useSearchStartupsQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!ventures.isFetched) {
            setOptions([]);
        } else if (ventures.data) {
            setOptions(
                ventures
                    .data
                    .Searches
                    ?.docs
                    .map(({ title, doc }) => ({ value: (doc.value as DocType)?.id || "", label: title, image: getImage(doc.value as DocType) })) || []
            );
        }
    }, [ventures.isFetched, ventures.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => { navigate(`/ventures/${value}`); props.onClose(); }}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={ventures.isLoading}
        />
    );
};
