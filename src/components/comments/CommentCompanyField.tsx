import * as React from "react";

import { Form } from "antd";

import { useServerUser } from "../auth/useServerUser";
import { CompanyField } from "../CompanyField";

type CommentCompanyFieldProps = {
    serverURL?: string | null;
};

export const CommentCompanyField: React.FunctionComponent<CommentCompanyFieldProps> = (props) => {
    const serverUser = useServerUser(props.serverURL);
    if (!serverUser.user) {
        return null;
    }
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
            <CompanyField serverURL={props.serverURL} />
        </Form.Item>
    );
};
