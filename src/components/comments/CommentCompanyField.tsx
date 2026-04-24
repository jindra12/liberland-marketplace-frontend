import * as React from "react";

import { Form } from "antd";

import { CompanyField } from "../CompanyField";

type CommentCompanyFieldProps = {
    serverURL?: string | null;
    userId: string;
};

export const CommentCompanyField: React.FunctionComponent<CommentCompanyFieldProps> = (props) => {
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
            <CompanyField serverURL={props.serverURL} userId={props.userId} />
        </Form.Item>
    );
};
