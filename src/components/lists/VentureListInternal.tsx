import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Space, Tag, message } from "antd";
import { RocketOutlined, UsergroupAddOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListStartupsQuery } from "../../generated/graphql";
import { formatStageLabel, formatResourceLabel } from "../../ventureUtils";
import { useJoinVentureMutation, useLeaveVentureMutation } from "../../ventureApi";

type VentureDoc = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];

const InvolvementButton: React.FunctionComponent<{ venture: VentureDoc; refetch: () => void }> = ({ venture, refetch }) => {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const joinMutation = useJoinVentureMutation();
    const leaveMutation = useLeaveVentureMutation();
    const userId = auth.user?.profile?.sub;

    if (!auth.isAuthenticated) return null;

    const isInvolved = userId
        ? venture.involvedUsers?.some((u) => u.id === userId) ?? false
        : false;

    const handleJoin = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await joinMutation.mutateAsync(venture.id);
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You joined this venture!");
        } catch {
            message.error("Failed to join venture");
        }
    };

    const handleLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await leaveMutation.mutateAsync(venture.id);
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You left this venture");
        } catch {
            message.error("Failed to leave venture");
        }
    };

    if (isInvolved) {
        return (
            <Button
                icon={<UserDeleteOutlined />}
                onClick={handleLeave}
                loading={leaveMutation.isPending}
                size="large"
            >
                Remove Involvement
            </Button>
        );
    }

    return (
        <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleJoin}
            loading={joinMutation.isPending}
            size="large"
        >
            Get Involved
        </Button>
    );
};

export interface VentureListInternalProps {
    query: UseQueryResult<ListStartupsQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}

export const VentureListInternal: React.FunctionComponent<VentureListInternalProps> = (props) => {
    const allItems = props.query.data?.Startups?.docs || [];

    return (
        <AppList
            hasMore={!props.query.data?.Startups || props.query.data.Startups.hasNextPage}
            items={allItems}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            title="Ventures"
            renderItem={{
                title: (venture) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Flex align="center" gap={8}>
                            <RocketOutlined />
                            {venture.title}
                        </Flex>
                        <Flex gap={4} wrap>
                            <Tag color="blue">{formatStageLabel(venture.stage)}</Tag>
                            {venture.identity?.name && (
                                <IdentityTagLink
                                    identity={venture.identity}
                                    color="success"
                                    icon={<UsergroupAddOutlined />}
                                />
                            )}
                        </Flex>
                    </Flex>
                ),
                actions: (venture) => (
                    <Space>
                        <InvolvementButton venture={venture} refetch={props.query.refetch} />
                        <Link to={`/ventures/${venture.id}`}>
                            <Button type="primary" variant="filled" className="ActionBtn" size="large">Details</Button>
                        </Link>
                    </Space>
                ),
                avatar: (venture) => venture.image?.url ? (
                    <Link to={`/ventures/${venture.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={`${BACKEND_URL}${venture.image.url}`}
                            className="EntityList__avatar"
                        />
                    </Link>
                ) : undefined,
                description: (venture) => (
                    <Flex gap={4} wrap className="VentureList__meta">
                        {venture.company?.name && (
                            <Tag>{venture.company.name}</Tag>
                        )}
                        {venture.lookingFor?.map((r) => (
                            <Tag key={r} color="orange">{formatResourceLabel(r)}</Tag>
                        ))}
                    </Flex>
                ),
                body: (venture) => (
                    <Markdown className="Markdown--clamp3 EntityList__description">{venture.description}</Markdown>
                ),
            }}
        />
    );
};
