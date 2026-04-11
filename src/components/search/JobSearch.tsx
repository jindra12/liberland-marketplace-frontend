import * as React from "react";

import { useNavigate } from "react-router-dom";

import { DocType, SearchOption } from "../../types";
import { AutoSuggest } from "../AutoSuggest";
import { useSearchJobsQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

export interface JobSearchProps {
    onClose: () => void;
}

export const JobSearch: React.FunctionComponent<JobSearchProps> = (props) => {
    const navigate = useNavigate();
    const [term, setTerm] = React.useState("");
    const jobs = useSearchJobsQuery(
        {
            searchTerm: term,
            limit: 5,
            page: 1,
        },
        {
            enabled: term.length > 0,
        },
    );
    const options: SearchOption[] =
        !term || !jobs.isFetched || !jobs.data
            ? []
            : (jobs.data.Searches?.docs ?? [])
                  .filter((searchDoc) => searchDoc.doc?.relationTo === "jobs")
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
            onSelect={(_, option) => {
                navigate(`/jobs/${option.id}`);
                props.onClose();
            }}
            options={options}
            title="Job search"
            runSearch={setTerm}
            setOptions={() => {
                setTerm("");
            }}
            isLoading={jobs.isLoading}
        />
    );
};
