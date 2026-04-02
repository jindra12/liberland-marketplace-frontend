import * as React from "react";
import { Link } from "react-router-dom";
import { Card, Flex, Space, Tag, Typography } from "antd";
import { BACKEND_URL } from "../../gqlFetcher";
import { useEndpointContext } from "../EndpointContext";
import { getSyndicationHost, getSyndicationName } from "../../utils";
import { NativeShareButton } from "../share/NativeShareButton";
import { RouteButton } from "../RouteButton";

export const SyndicationSection: React.FunctionComponent = () => {
    const { urls, enabled } = useEndpointContext();
    const items = React.useMemo(
        () =>
            [...urls].sort((left, right) => {
                if (left.name === "Main" && right.name !== "Main") {
                    return -1;
                }
                if (right.name === "Main" && left.name !== "Main") {
                    return 1;
                }
                if (left.enabled !== right.enabled) {
                    return left.enabled ? -1 : 1;
                }
                return getSyndicationName(left).localeCompare(getSyndicationName(right), "en", { sensitivity: "base" });
            }),
        [urls],
    );

    if (items.length <= 1) {
        return null;
    }

    return (
        <section className="SplashPage__syndicationSection">
            <Flex justify="space-between" align="flex-end" wrap gap={16} className="SplashPage__syndicationHeader">
                <Flex vertical gap={8} className="SplashPage__syndicationHeaderCopy">
                    <span className="SplashPage__syndicationEyebrow">Syndication</span>
                    <Typography.Title level={2} className="SplashPage__syndicationTitle">
                        Manage syndicated marketplace URLs
                    </Typography.Title>
                    <Typography.Paragraph className="SplashPage__syndicationDescription">
                        Currently tracking {urls.length} endpoints with {enabled.length} enabled for browsing. Open the list to add new URLs, and use any card to review or toggle a specific syndicated
                        source.
                    </Typography.Paragraph>
                </Flex>
                <RouteButton to="/syndication" type="primary" className="SplashPage__syndicationManageBtn">
                    Manage endpoints
                </RouteButton>
            </Flex>

            <div className="SplashPage__syndicationGrid">
                {items.map((endpoint) => {
                    const host = getSyndicationHost(endpoint.value);
                    const isDefault = endpoint.value === BACKEND_URL;
                    const eyebrow = endpoint.enabled ? "Enabled" : "Available";
                    const detailHref = `/syndication/${encodeURIComponent(endpoint.value)}`;
                    const description = endpoint.description || "Configured marketplace endpoint.";

                    return (
                        <Card
                            key={endpoint.value}
                            className={`SplashEntityCard SplashPage__syndicationEntityCard${endpoint.enabled ? " SplashPage__syndicationEntityCard--enabled" : ""}`}
                            title={
                                <Flex vertical gap={4} className="SplashPage__syndicationCardHeader">
                                    <span className="SplashPage__syndicationCardEyebrow">{eyebrow}</span>
                                    <Typography.Title level={4} className="SplashPage__syndicationCardTitle">
                                        <Link to={detailHref} className="SplashPage__syndicationCardTitleLink">
                                            {getSyndicationName(endpoint)}
                                        </Link>
                                    </Typography.Title>
                                    <Typography.Text className="SplashPage__syndicationCardHost">{host}</Typography.Text>
                                </Flex>
                            }
                            extra={isDefault ? <Tag color="blue">Main</Tag> : undefined}
                        >
                            <Flex vertical gap={16} className="SplashPage__syndicationCardBody">
                                <Typography.Paragraph className="SplashPage__syndicationCardDescription">{description}</Typography.Paragraph>
                                <Flex wrap gap={8} className="SplashEntityCard__meta SplashPage__syndicationCardTags">
                                    <Tag color={endpoint.enabled ? "success" : "default"}>{endpoint.enabled ? "Visible in search" : "Disabled"}</Tag>
                                    {!isDefault && <Tag>{endpoint.enabled ? "Active source" : "Available source"}</Tag>}
                                </Flex>
                                <Flex justify="space-between" align="center" wrap gap={12} className="SplashPage__syndicationCardActions">
                                    <Typography.Text className="SplashPage__syndicationCardMetaCopy">
                                        {endpoint.enabled ? "Included in marketplace browsing." : "Stored locally until enabled."}
                                    </Typography.Text>
                                    <Space.Compact className="SplashPage__syndicationCardCompactActions">
                                        <NativeShareButton
                                            path={detailHref}
                                            title={getSyndicationName(endpoint)}
                                            text={`Check out ${getSyndicationName(endpoint)} on NSwap.`}
                                            className="NativeShareButton"
                                        />
                                        <RouteButton to={detailHref} type="primary">
                                            Details
                                        </RouteButton>
                                    </Space.Compact>
                                </Flex>
                            </Flex>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
};
