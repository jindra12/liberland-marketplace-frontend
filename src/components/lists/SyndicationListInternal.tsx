import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Grid, Input, Space, Tag, Typography, message } from "antd";
import { GlobalOutlined, LinkOutlined, PoweroffOutlined } from "@ant-design/icons";
import { AppList } from "../AppList";
import { useEndpointContext } from "../EndpointContext";
import { URL } from "../../types";
import { createEndpointEntry, getSyndicationHost, getSyndicationName, insertUniqueEndpoint, setEndpointEnabled } from "../endpoints/utils";
import { Markdown } from "../Markdown";
import { NativeShareButton } from "../share/NativeShareButton";
import { RouteButton } from "../RouteButton";

const buildSyndicationHref = (value: string) => `/syndication/${encodeURIComponent(value)}`;

const byPriority = (entry: URL) => {
    if (entry.name === "Main") {
        return 0;
    }
    return entry.enabled ? 1 : 2;
};

export const SyndicationListInternal: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const { urls, setUrls } = useEndpointContext();
    const [draftUrl, setDraftUrl] = React.useState("");
    const [messageApi, messageContextHolder] = message.useMessage();

    const items = React.useMemo(
        () =>
            [...urls].sort((left, right) => {
                const leftPriority = byPriority(left);
                const rightPriority = byPriority(right);

                if (leftPriority !== rightPriority) {
                    return leftPriority - rightPriority;
                }

                return getSyndicationName(left).localeCompare(getSyndicationName(right), "en", { sensitivity: "base" });
            }),
        [urls],
    );

    const handleAdd = React.useCallback(() => {
        if (!draftUrl.trim()) {
            messageApi.warning("Enter a URL first");
            return;
        }

        try {
            const nextEntry = createEndpointEntry(draftUrl);
            setUrls((current) => insertUniqueEndpoint(current, nextEntry));
            setDraftUrl("");
            messageApi.success(`Added ${getSyndicationHost(nextEntry.value)}`);
        } catch (error) {
            const reason = error instanceof Error ? error.message : "";
            if (reason === "invalid protocol") {
                messageApi.error("Please enter a valid http(s) URL.");
                return;
            }
            if (reason === "duplicate") {
                messageApi.error("This URL already exists.");
                return;
            }
            messageApi.error("Could not add this syndicated URL.");
        }
    }, [draftUrl, messageApi, setUrls]);

    return (
        <>
            {messageContextHolder}
            <AppList
                hasMore={false}
                items={items}
                next={() => {}}
                refetch={() => Promise.resolve()}
                loading={false}
                title="Syndication"
                emptyText="No syndicated URLs configured yet."
                filters={
                    <Space.Compact block className="SyndicationList__addCompact">
                        <Input value={draftUrl} prefix={<LinkOutlined />} placeholder="https://your-backend.example" onChange={(event) => setDraftUrl(event.target.value)} onPressEnter={handleAdd} />
                        <Button type="primary" onClick={handleAdd}>
                            Add URL
                        </Button>
                    </Space.Compact>
                }
                renderItem={{
                    title: (entry) => (
                        <Flex justify="space-between" align="center" wrap>
                            <Link to={buildSyndicationHref(entry.value)}>{getSyndicationName(entry)}</Link>
                            <Tag color={entry.enabled ? "success" : "default"}>{entry.enabled ? "Enabled" : "Disabled"}</Tag>
                        </Flex>
                    ),
                    avatar: (entry) => (
                        <Link to={buildSyndicationHref(entry.value)}>
                            <Avatar shape="square" size={80} icon={<GlobalOutlined />} className="EntityList__avatar SyndicationList__avatar" />
                        </Link>
                    ),
                    description: (entry) => (
                        <Flex vertical gap={8}>
                            <Typography.Text type="secondary" className="SyndicationList__host">
                                {getSyndicationHost(entry.value)}
                            </Typography.Text>
                            <Flex wrap gap={8}>
                                <Tag>{entry.name === "Main" ? "Primary" : "Syndicated"}</Tag>
                                <Tag color={entry.enabled ? "success" : "default"}>{entry.enabled ? "Visible in search" : "Hidden from search"}</Tag>
                            </Flex>
                        </Flex>
                    ),
                    body: (entry) => <Markdown className="Markdown--clamp3 SyndicationList__description">{entry.description}</Markdown>,
                    actions: (entry) =>
                        md ? (
                            <Flex wrap gap="16px" align="center" justify="flex-end" className="EntityList__actionsRow">
                                <NativeShareButton
                                    path={buildSyndicationHref(entry.value)}
                                    title={getSyndicationName(entry)}
                                    text={`Check out ${getSyndicationName(entry)} on NSwap.`}
                                    size="large"
                                    className="NativeShareButton"
                                />
                                <Button size="large" icon={<PoweroffOutlined />} onClick={() => setUrls((current) => setEndpointEnabled(current, entry.value, !entry.enabled))}>
                                    {entry.enabled ? "Disable" : "Enable"}
                                </Button>
                                <RouteButton to={buildSyndicationHref(entry.value)} type="primary" variant="filled" className="ActionBtn" size="large">
                                    Details
                                </RouteButton>
                            </Flex>
                        ) : (
                            <Flex vertical gap="12px" className="EntityList__actionsRow SyndicationList__actionsRow">
                                <Space.Compact block className="SyndicationList__compactActions">
                                    <NativeShareButton
                                        path={buildSyndicationHref(entry.value)}
                                        title={getSyndicationName(entry)}
                                        text={`Check out ${getSyndicationName(entry)} on NSwap.`}
                                        size="large"
                                        className="NativeShareButton"
                                    />
                                    <RouteButton to={buildSyndicationHref(entry.value)} size="large" className="ActionBtn">
                                        Details
                                    </RouteButton>
                                </Space.Compact>
                                <Button size="large" block icon={<PoweroffOutlined />} onClick={() => setUrls((current) => setEndpointEnabled(current, entry.value, !entry.enabled))}>
                                    {entry.enabled ? "Disable" : "Enable"}
                                </Button>
                            </Flex>
                        ),
                }}
            />
        </>
    );
};
