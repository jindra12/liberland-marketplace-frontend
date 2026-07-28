import * as React from "react";

import { Button, Drawer, Form, Input, InputRef, Space } from "antd";

import { TEXT_INPUT_MAX_LENGTH, buildMaxLengthRule } from "../form/constants";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";

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
    const [form] = Form.useForm<{ searchValue?: string }>();

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
                    form={form}
                    className="SearchDrawer__footerForm"
                    onFinish={props.onSubmit}
                    onValuesChange={(_, allValues: { searchValue?: string }) => {
                        props.onSearchValueChange(allValues.searchValue ?? "");
                    }}
                    initialValues={{
                        searchValue: props.searchValue,
                    }}
                >
                    <Space.Compact block className="SearchDrawer__footerCompact">
                        <Form.Item
                            name="searchValue"
                            className="SearchDrawer__footerInputItem"
                            rules={[
                                { required: true, whitespace: true, message: "Search is required" },
                                buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                            ]}
                            noStyle={false}
                        >
                            <Input
                                ref={inputRef}
                                size="large"
                                placeholder={props.placeholder}
                                className="SearchDrawer__footerInput"
                            />
                        </Form.Item>
                        <Button size="large" type="primary" htmlType="submit" className="SearchDrawer__footerButton">
                            Search
                        </Button>
                    </Space.Compact>
                </Form>
            }
        >
            <div
                id={SEARCH_DRAWER_SCROLLABLE_ID}
                className="SearchDrawer__scrollable"
            >
                {props.children}
            </div>
        </Drawer>
    );
};
