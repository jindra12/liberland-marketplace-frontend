import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";

import { getImage } from "../../utils";
import { useSearchStartupsQuery } from "../hooks";

export interface StartupsSearchProps {
    onClose: () => void;
}

export const StartupsSearch: React.FunctionComponent<StartupsSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState("");
    const startups = useSearchStartupsQuery({
        searchTerm: term,
        limit: 5,
        page: 0,
    }, {
        enabled: term.length > 0,
    });

    React.useEffect(() => {
        if (!startups.isFetched) {
            setOptions([]);
        } else if (startups.data) {
            setOptions(
                (startups.data.Searches?.docs ?? [])
                .filter((searchDoc) => searchDoc.doc?.relationTo === "startups")
                .map((searchDoc, index) => {
                    const doc = searchDoc.doc!.value as DocType;
                    const value = `${doc.serverURL || ""}|${doc.id!}`;

                    return {
                        key: `${searchDoc.id}-${doc.serverURL || ""}-${value}-${index}`,
                        value,
                        id: doc.id!,
                        label: searchDoc.title,
                        image: getImage(doc),
                    };
                })
            );
        }
    }, [startups.isFetched, startups.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { id }) => { navigate(`/ventures/${id}`); props.onClose(); }}
            options={options}
            title="Startup search"
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={startups.isLoading}
        />
    );
};
