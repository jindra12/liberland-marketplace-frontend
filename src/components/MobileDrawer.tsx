import * as React from "react";

import { Avatar, Drawer } from "antd";

import { MobileDrawerContent } from "./MobileDrawer/MobileDrawerContent";
import { useMobileDrawerModel } from "./MobileDrawer/useMobileDrawerModel";

type MobileDrawerProps = {
    open: boolean;
    onClose: () => void;
};

export const MobileDrawer: React.FunctionComponent<MobileDrawerProps> = (props) => {
    const model = useMobileDrawerModel(props.onClose);

    return (
        <Drawer
            className="AppHeader__drawer"
            placement="left"
            open={props.open}
            onClose={props.onClose}
            title={
                <div className="AppHeader__drawerTitle">
                    <Avatar className="AppHeader__logo" src="/logo.svg" shape="square" size={38} />
                    <span className="AppHeader__name">NSwap</span>
                </div>
            }
        >
            <MobileDrawerContent model={model} />
        </Drawer>
    );
};
