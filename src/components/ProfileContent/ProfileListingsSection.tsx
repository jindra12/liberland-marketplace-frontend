import * as React from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Tabs, Typography } from "antd";

import { Company, Job, Product, Startup } from "../../generated/graphql";
import { routes } from "../../routes";
import {
    useDeleteCompanyMutation,
    useDeleteJobMutation,
    useDeleteProductMutation,
    useDeleteStartupMutation,
    useListCompaniesByCreatorQuery,
    useListJobsByCreatorQuery,
    useListProductsByCreatorQuery,
    useListStartupsByCreatorQuery,
} from "../hooks";
import { ProfileListingList } from "../ProfileListingList";
import { RouteButton } from "../RouteButton";
import { formatEmploymentType } from "../shared/job/utils";

type ProfileListingsSectionProps = {
    userId?: string;
    serverURL?: string | null;
};
export const ProfileListingsSection: React.FunctionComponent<ProfileListingsSectionProps> = (props) => {
    const deleteJobMutation = useDeleteJobMutation();
    const deleteCompanyMutation = useDeleteCompanyMutation();
    const deleteProductMutation = useDeleteProductMutation();
    const deleteStartupMutation = useDeleteStartupMutation();
    const jobsQuery = useListJobsByCreatorQuery(
        {
            userId: props.userId,
            draft: true,
            url: props.serverURL,
        },
        {
            enabled: !!props.userId,
            refetchOnMount: "always",
        },
    );
    const companiesQuery = useListCompaniesByCreatorQuery(
        {
            userId: props.userId,
            draft: true,
            url: props.serverURL,
        },
        {
            enabled: !!props.userId,
            refetchOnMount: "always",
        },
    );
    const startupsQuery = useListStartupsByCreatorQuery(
        {
            userId: props.userId,
            draft: true,
            url: props.serverURL,
        },
        {
            enabled: !!props.userId,
            refetchOnMount: "always",
        },
    );
    const companyIds = (companiesQuery.data?.Companies?.docs ?? []).map((company) => company.id);
    const productsQuery = useListProductsByCreatorQuery(
        {
            companyIds,
            draft: true,
            url: props.serverURL,
        },
        {
            enabled: companyIds.length > 0,
            refetchOnMount: "always",
        },
    );
    const jobs = jobsQuery.data?.Jobs?.docs ?? [];
    const companies = companiesQuery.data?.Companies?.docs ?? [];
    const startups = startupsQuery.data?.Startups?.docs ?? [];
    const products = productsQuery.data?.Products?.docs ?? [];
    const listingTabs = [
        {
            key: "jobs",
            label: `Jobs (${jobsQuery.data?.Jobs?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteJobMutation}
                    label="Job"
                    emptyText="No jobs created yet"
                    items={jobs as Job[]}
                    loading={jobsQuery.isLoading}
                    refetch={jobsQuery.refetch}
                    routePrefix={routes.jobs}
                    renderMeta={(job) => ({
                        title: job.title,
                        description: formatEmploymentType(job.employmentType),
                    })}
                />
            ),
        },
        {
            key: "companies",
            label: `Companies (${companiesQuery.data?.Companies?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteCompanyMutation}
                    label="Company"
                    emptyText="No companies created yet"
                    items={companies as Company[]}
                    loading={companiesQuery.isLoading}
                    refetch={companiesQuery.refetch}
                    routePrefix={routes.companies}
                    renderMeta={(company) => ({
                        title: company.name,
                    })}
                />
            ),
        },
        {
            key: "startups",
            label: `Ventures (${startupsQuery.data?.Startups?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteStartupMutation}
                    label="Venture"
                    emptyText="No ventures created yet"
                    items={startups as Startup[]}
                    loading={startupsQuery.isLoading}
                    refetch={startupsQuery.refetch}
                    routePrefix={routes.ventures}
                    renderMeta={(startup) => ({
                        title: startup.title,
                    })}
                />
            ),
        },
        {
            key: "products",
            label: `Products (${productsQuery.data?.Products?.totalDocs ?? 0})`,
            children: (
                <ProfileListingList
                    deleteMutation={deleteProductMutation}
                    label="Product / service"
                    emptyText="No products or services created yet"
                    items={products as Product[]}
                    loading={productsQuery.isLoading}
                    refetch={productsQuery.refetch}
                    routePrefix={routes.productsServices}
                    renderMeta={(product) => ({
                        title: product.name,
                    })}
                />
            ),
        },
    ];
    return (
        <>
            <div className="Profile__listingsHeader">
                <Typography.Title level={3} className="Profile__listingsTitle">
                    My Listings
                </Typography.Title>
                <RouteButton to={routes.publish.route} type="primary" icon={<PlusOutlined />}>
                    Create
                </RouteButton>
            </div>
            <Tabs items={listingTabs} />
        </>
    );
};
