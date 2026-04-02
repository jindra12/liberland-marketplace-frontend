import * as React from "react";

import { useNavigate } from "react-router-dom";

import { DocType, SearchOption } from "../../types";
import { AutoSuggest } from "../AutoSuggest";
import { useSearchStartupsQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

export interface StartupsSearchProps {
    onClose: () => void;
}

export const StartupsSearch: React.FunctionComponent<StartupsSearchProps> = (props) => {
    const navigate = useNavigate();
    const [term, setTerm] = React.useState("");
    const startups = useSearchStartupsQuery(
        {
            searchTerm: term,
            limit: 5,
            page: 0,
        },
        {
            enabled: term.length > 0,
        },
    );
    const options: SearchOption[] =
        !term || !startups.isFetched || !startups.data
            ? []
            : (startups.data.Searches?.docs ?? [])
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
                  });

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { id }) => {
                navigate(`/ventures/${id}`);
                props.onClose();
            }}
            options={options}
            title="Startup search"
            runSearch={setTerm}
            setOptions={() => {
                setTerm("");
            }}
            isLoading={startups.isLoading}
        />
    );
};
