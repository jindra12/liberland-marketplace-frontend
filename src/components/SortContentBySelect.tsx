import * as React from "react";

import { Flex, Select, Typography } from "antd";

import { sortContentOptions } from "./SortContentBySelect/constants";
import { useSortContent } from "./SortContentBySelect/useSortContent";

export const SortContentBySelect: React.FunctionComponent = () => {
    const [value, setValue] = useSortContent();

    return (
        <Flex vertical gap={8} className="AppHeader__sortControl">
            <Typography.Text className="AppHeader__sortLabel">Sort content by</Typography.Text>
            <Select
                className="AppHeader__sortSelect"
                classNames={{
                    popup: {
                        root: "AppHeader__sortSelectDropdown",
                    },
                }}
                value={value}
                options={sortContentOptions}
                onChange={setValue}
                size="large"
            />
        </Flex>
    );
};
