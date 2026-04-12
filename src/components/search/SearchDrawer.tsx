import * as React from "react";

import { Button, Drawer, Form, Input, InputRef } from "antd";

type SearchDrawerProps = {
    title: string;
    onClose: () => void;
    searchValue: string;
    onSearchValueChange: (value: string) => void;
    onSubmit: () => void;
    children: React.ReactNode;
    placeholder: string;
};

export const SearchDrawer: React.FunctionComponent<SearchDrawerProps> = (props) => {
    const inputRef = React.useRef<InputRef>(null);
    const [form] = Form.useForm();

    return (
        <Drawer
            open
            onClose={props.onClose}
            width="100%"
            title={props.title}
            closable
            destroyOnHidden
            afterOpenChange={(open) => {
                if (open) {
                    inputRef.current?.focus();
                }
            }}
            className="SearchDrawer"
            footer={
                <Form
                    className="SearchDrawer__footerForm"
                    onFinish={props.onSubmit}
                    form={form}
                >
                    <Form.Item className="SearchDrawer__footerInputItem" noStyle>
                        <Input
                            ref={inputRef}
                            size="large"
                            placeholder={props.placeholder}
                            value={props.searchValue}
                            onChange={(event) => props.onSearchValueChange(event.target.value)}
                            className="SearchDrawer__footerInput"
                        />
                    </Form.Item>
                    <Button size="large" type="primary" htmlType="submit">
                        Search
                    </Button>
                </Form>
            }
        >
            {props.children}
        </Drawer>
    );
};
