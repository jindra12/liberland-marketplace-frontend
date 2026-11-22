import * as React from "react";

import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, List, message, Popconfirm, Space, Tag } from "antd";

import { RouteButton } from "./RouteButton";

interface ProfileListingItem {
    id: string;
    serverURL?: string | null;
    _status?: string | null;
}

interface ProfileListingListProps<TItem extends ProfileListingItem> {
    deleteMutation: { mutateAsync: (vars: { id: string; url: string }) => Promise<unknown> };
    serverURL?: string | null;
    label: string;
    emptyText: string;
    items: TItem[];
    loading: boolean;
    refetch: () => Promise<unknown> | void;
    renderMeta: (item: TItem) => {
        description?: React.ReactNode;
        title: React.ReactNode;
    };
    routePrefix: {
        detail: {
            getLink: (item: TItem) => string;
        };
        edit: {
            getLink: (item: TItem) => string;
        };
    };
}

export const ProfileListingList = <TItem extends ProfileListingItem>(props: ProfileListingListProps<TItem>) => {
    const handleDelete = async (item: TItem) => {
        try {
            const url = props.serverURL || item.serverURL;
            if (!url) {
                throw new Error("The listing's source server is missing. Reload the listing before deleting it.");
            }
            await props.deleteMutation.mutateAsync({ id: item.id, url });
            message.success(`${props.label} deleted`);
            await props.refetch();
        } catch (error) {
            console.error(`Failed to delete ${props.label.toLowerCase()}`, error);
            message.error(`Failed to delete ${props.label.toLowerCase()}`);
        }
    };

    return (
        <List
            loading={props.loading}
            dataSource={props.items}
            locale={{ emptyText: props.emptyText }}
            renderItem={(item) => {
                const sourceItem = { ...item, serverURL: props.serverURL || item.serverURL };
                const canView = item._status !== "draft";
                const meta = props.renderMeta(item);
                const title =
                    item._status === "draft" ? (
                        <Space>
                            {meta.title}
                            <Tag color="orange">Draft</Tag>
                        </Space>
                    ) : (
                        meta.title
                    );

                return (
                    <List.Item
                        actions={[
                            <RouteButton
                                key="edit"
                                to={props.routePrefix.edit.getLink(sourceItem)}
                                size="small"
                                icon={<EditOutlined />}
                            >
                                Edit
                            </RouteButton>,
                            canView ? (
                                <RouteButton
                                    key="view"
                                    to={props.routePrefix.detail.getLink(sourceItem)}
                                    size="small"
                                    type="link"
                                    icon={<EyeOutlined />}
                                >
                                    View
                                </RouteButton>
                            ) : null,
                            <Popconfirm
                                key="delete"
                                title={`Delete this ${props.label.toLowerCase()}?`}
                                onConfirm={() => handleDelete(item)}
                                okText="Delete"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger icon={<DeleteOutlined />}>
                                    Delete
                                </Button>
                            </Popconfirm>,
                        ]}
                    >
                        <List.Item.Meta {...meta} title={title} />
                    </List.Item>
                );
            }}
        />
    );
};
