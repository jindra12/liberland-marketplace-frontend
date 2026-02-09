import React from "react";
import { AutoComplete, AutoCompleteProps, Avatar, Drawer, Flex, Input, InputRef } from "antd";

import { SearchOption } from "../types";

export interface AutoSuggestProps {
    runSearch: (query: string) => void;
    setOptions: (options: SearchOption[]) => void;
    options: SearchOption[];
    onClose: () => void;
    onSelect: (value: string, option: SearchOption) => void;
    isLoading: boolean;
}

export const AutoSuggest: React.FunctionComponent<AutoSuggestProps> = (props) => {
    const inputRef = React.useRef<InputRef>(null);
    const [value, setValue] = React.useState("");

    const onSearch: AutoCompleteProps["onSearch"] = async (text) => {
        const trimmed = text.trim();

        setValue(trimmed);

        if (!trimmed) {
            props.setOptions([]);
            return;
        }

        props.runSearch(trimmed);
    };

    return (
        <Drawer
            open
            onClose={props.onClose}
            width="100%"
            title="Search"
            closable
            destroyOnHidden
            afterOpenChange={(open) => {
                if (open) {
                    inputRef.current?.focus();
                }
            }}
        >
            <Flex vertical gap={16}>
                <Flex align="center" gap={12}>
                    <AutoComplete
                        value={value}
                        options={props.options.map((option) => ({
                            ...option,
                            label: (
                                <Flex align="center" gap="8px">
                                    {option.image && (
                                        <Avatar src={option.image} size={24} />
                                    )}
                                    {option.label}
                                </Flex>
                            ),
                        }))}
                        onSearch={onSearch}
                        onSelect={props.onSelect}
                        onChange={setValue}
                    >
                        <Input.Search
                            size="large"
                            placeholder="Type to search"
                            enterButton
                            loading={props.isLoading}
                            onSearch={onSearch}
                            ref={inputRef}
                        />
                    </AutoComplete>
                </Flex>
            </Flex>
        </Drawer>
    );
};