import * as React from "react";

import { useNavigate } from "react-router-dom";

import { DocType, SearchOption } from "../../types";
import { AutoSuggest } from "../AutoSuggest";
import { useSearchIdentitiesQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

export interface IdentitiesSearchProps {
    onClose: () => void;
}

export const IdentitiesSearch: React.FunctionComponent<IdentitiesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState("");
    const identities = useSearchIdentitiesQuery(
        {
            searchTerm: term,
            limit: 5,
            page: 0,
        },
        {
            enabled: term.length > 0,
        },
    );

    React.useEffect(() => {
        if (!identities.isFetched) {
            setOptions([]);
        } else if (identities.data) {
            setOptions(
                (identities.data.Searches?.docs ?? [])
                    .filter((searchDoc) => searchDoc.doc?.relationTo === "identities")
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
                    }),
            );
        }
    }, [identities.isFetched, identities.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, option) => {
                navigate(`/tribes/${option.id}`);
                props.onClose();
            }}
            options={options}
            title="Tribe search"
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={identities.isLoading}
        />
    );
};
