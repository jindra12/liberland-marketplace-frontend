import * as React from "react";

import { GlobalOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";

import { routes } from "../../routes";
import { DisclaimersButton } from "../disclaimers/DisclaimersButton";
import { EndpointAuthAction } from "../EndpointAuthAction";
import type { MobileDrawerModel } from "../MobileDrawer/types";
import { RouteButton } from "../RouteButton";
import { SearchButton } from "../SearchButton";
import { SortContentBySelect } from "../SortContentBySelect";

type MobileDrawerContentProps = {
    model: MobileDrawerModel;
};

export const MobileDrawerContent: React.FunctionComponent<MobileDrawerContentProps> = (props) => {
    return (
        <div className="AppHeader__drawerBody">
            <Menu
                className="AppHeader__drawerMenu"
                mode="inline"
                items={props.model.menuItems}
                selectedKeys={props.model.selectedKeys}
            />
            <div className="AppHeader__drawerNav">
                <SearchButton type="default" block onScopeSelect={props.model.onSearchScopeSelect}>
                    Search
                </SearchButton>
                <DisclaimersButton block onClick={props.model.onOpenDisclaimers} />
                {props.model.showSyndication ? (
                    <RouteButton to={routes.syndication.route} block type="default" icon={<GlobalOutlined />}>
                        Syndication
                    </RouteButton>
                ) : null}
                <EndpointAuthAction>
                    {({ runWithEndpointSelection }) => (
                        <Button
                            block
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={(event) => {
                                event.preventDefault();
                                runWithEndpointSelection(props.model.onPublish);
                            }}
                            className="AppHeader__drawerPublish"
                        >
                            Create
                        </Button>
                    )}
                </EndpointAuthAction>
                {props.model.isAuthenticated ? (
                    <Button block icon={<UserOutlined />} onClick={props.model.onProfile}>
                        Profile
                    </Button>
                ) : null}
                <SortContentBySelect />
            </div>
        </div>
    );
};
