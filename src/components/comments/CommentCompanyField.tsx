import * as React from "react";

import { Form } from "antd";

import { useListCompaniesByCreatorQuery } from "../hooks";
import { CompanyField } from "../publish/postForm/CompanyField";

type CommentCompanyFieldProps = {
    serverURL?: string | null;
    userId: string;
};

export const CommentCompanyField: React.FunctionComponent<CommentCompanyFieldProps> = (props) => {
    const companiesQuery = useListCompaniesByCreatorQuery({
        userId: props.userId,
        draft: true,
        url: props.serverURL,
    });
    const companies = companiesQuery.data?.Companies?.docs ?? [];

    return (
        <Form.Item
            name="company"
            label="Author company"
            rules={[
                {
                    required: true,
                    message: "Select an author company",
                },
            ]}
        >
            <CompanyField companies={companies} />
        </Form.Item>
    );
};
