import * as React from "react";

import { GlobalOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";

import { routes } from "../../routes";
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
                {props.model.showSyndication ? (
                    <RouteButton to={routes.syndication.route} block type="default" icon={<GlobalOutlined />}>
                        Syndication
                    </RouteButton>
                ) : null}
                <EndpointAuthAction>
                    {({ runWithAuthOrLogin }) => (
                        <Button
                            block
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={(event) => {
                                event.preventDefault();
                                runWithAuthOrLogin(props.model.onPublish, {
                                    onUnauthorizedBeforeLogin: props.model.onUnauthorizedBeforeLogin,
                                });
                            }}
                            className="AppHeader__drawerPublish"
                        >
                            Publish ad
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
