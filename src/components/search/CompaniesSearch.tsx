import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";

import { getImage } from "../../utils";
import { useSearchCompaniesQuery } from "../hooks";

export interface CompaniesSearchProps {
    onClose: () => void;
}

export const CompaniesSearch: React.FunctionComponent<CompaniesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState("");
    const companies = useSearchCompaniesQuery(
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
        if (!companies.isFetched) {
            setOptions([]);
        } else if (companies.data) {
            setOptions(
                (companies.data.Searches?.docs ?? [])
                    .filter((searchDoc) => searchDoc.doc?.relationTo === "companies")
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
    }, [companies.isFetched, companies.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, option) => {
                navigate(`/companies/${option.id}`);
                props.onClose();
            }}
            options={options}
            title="Company search"
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={companies.isLoading}
        />
    );
};
