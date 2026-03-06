import * as React from "react";
import { Alert, Empty, Flex, Spin, Typography } from "antd";
import {
    TeamOutlined,
    ShopOutlined,
    ToolOutlined,
    RocketOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
    useListIdentitiesQuery,
    useListCompaniesQuery,
    useListJobsQuery,
    useListProductsQuery,
    useListStartupsQuery,
} from "../generated/graphql";
import { IdentityMarketSection } from "./splash/IdentityMarketSection";

const categories = [
    { label: "Companies", path: "/companies", icon: <TeamOutlined /> },
    { label: "Products & Services", path: "/products-services", icon: <ShopOutlined /> },
    { label: "Jobs", path: "/jobs", icon: <ToolOutlined /> },
    { label: "Ventures", path: "/ventures", icon: <RocketOutlined /> },
];

const Splash: React.FunctionComponent = () => {
    const identitiesQuery = useListIdentitiesQuery({ page: 1, limit: 100, sort: "name" });
    const companiesQuery = useListCompaniesQuery({ page: 1, limit: 1 });
    const jobsQuery = useListJobsQuery({ page: 1, limit: 1 });
    const productsQuery = useListProductsQuery({ page: 1, limit: 1 });
    const startupsQuery = useListStartupsQuery({ page: 1, limit: 1 });

    const identities = identitiesQuery.data?.Identities?.docs || [];
    const isLoading = identitiesQuery.isLoading;
    const hasError = Boolean(identitiesQuery.error);

    const stats = [
        { count: companiesQuery.data?.Companies?.totalDocs ?? 0, label: "Companies" },
        { count: productsQuery.data?.Products?.totalDocs ?? 0, label: "Products" },
        { count: jobsQuery.data?.Jobs?.totalDocs ?? 0, label: "Jobs" },
        { count: startupsQuery.data?.Startups?.totalDocs ?? 0, label: "Ventures" },
        { count: identitiesQuery.data?.Identities?.totalDocs ?? 0, label: "Tribes" },
    ];

    const sortedIdentities = React.useMemo(
        () => [...identities || []].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0)),
        [identities],
    );

    return (
        <Flex vertical gap={24} className="SplashPage">
            <section className="SplashHero">
                <div className="SplashHero__orb SplashHero__orb--1" />
                <div className="SplashHero__orb SplashHero__orb--2" />
                <div className="SplashHero__orb SplashHero__orb--3" />
                <div className="SplashHero__grid" />

                <div className="SplashHero__content">
                    <Typography.Title level={1} className="SplashHero__title">
                        Discover <span className="SplashHero__titleAccent">companies</span>,{" "}
                        <span className="SplashHero__titleAccent">jobs</span>,{" "}
                        <span className="SplashHero__titleAccent">products</span> &{" "}
                        <span className="SplashHero__titleAccent">ventures</span>
                    </Typography.Title>

                    <Typography.Paragraph className="SplashHero__subtitle">
                        Tribe-first marketplace. Those who organize into tribes outcompete those who do not.
                        Explore the catalogue or publish your own.
                    </Typography.Paragraph>

                    <nav className="SplashHero__categories">
                        {categories.map((cat) => (
                            <Link key={cat.path} to={cat.path} className="SplashHero__categoryPill">
                                {cat.icon}
                                <span>{cat.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="SplashHero__stats">
                        {stats.map((s) => (
                            <div key={s.label} className="SplashHero__stat">
                                <span className="SplashHero__statCount">{s.count}</span>
                                <span className="SplashHero__statLabel">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="SplashPage__sections">
                {hasError && (
                    <Alert
                        type="error"
                        showIcon
                        message="Failed to load tribes"
                        description="Try refreshing the page."
                    />
                )}

                {!hasError && !identities?.length && isLoading && (
                    <Flex justify="center" align="center" className="SplashPage__loading">
                        <Spin />
                    </Flex>
                )}

                {!hasError && !identities?.length && !isLoading && (
                    <Empty description="No tribes found yet." />
                )}

                {sortedIdentities.length > 0 && (
                    <Flex vertical gap={24} className="SplashPage__identityList">
                        {sortedIdentities.map((identity) => (
                            <IdentityMarketSection
                                key={identity.id}
                                identityId={identity.id}
                                identityName={identity.name || "Tribe"}
                                identityImageUrl={identity.image?.url || undefined}
                            />
                        ))}
                    </Flex>
                )}
            </div>
        </Flex>
    );
};

export default Splash;
