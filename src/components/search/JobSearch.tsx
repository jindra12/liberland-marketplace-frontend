import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";
import { useSearchJobsQuery } from "../../generated/graphql";
import { getImage } from "../../utils";

export interface JobSearchProps {
    onClose: () => void;
}

export const JobSearch: React.FunctionComponent<JobSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const jobs = useSearchJobsQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!jobs.isFetched) {
            setOptions([]);
        } else if (jobs.data) {
            setOptions(jobs
                .data
                .Searches
                ?.docs
                .map(({ id, title, doc }) => ({ value: id, label: title, image: getImage(doc.value as DocType) })) || []);
        }
    }, [jobs.isFetched, jobs.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/jobs/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={jobs.isLoading}
        />
    );
};