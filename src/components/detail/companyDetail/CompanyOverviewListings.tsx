import * as React from "react";

import { Link } from "react-router-dom";

import type { UseQueryResult } from "@tanstack/react-query";

import { Alert, List, Skeleton, Tabs } from "antd";

import type { Job, ListJobsByCompanyQuery, ListProductsByCompanyQuery, Product } from "../../../generated/graphql";
import { routes } from "../../../routes";
import { Markdown } from "../../Markdown";
import { getSourceQualifiedEntityKey } from "../../query/utils";

interface CompanyOverviewListingsProps {
    jobs: UseQueryResult<ListJobsByCompanyQuery>;
    products: UseQueryResult<ListProductsByCompanyQuery>;
}

export const CompanyOverviewListings: React.FunctionComponent<CompanyOverviewListingsProps> = (props) => {
    if (props.products.isLoading || props.jobs.isLoading) {
        return <Skeleton active paragraph={{ rows: 2 }} />;
    }

    const items = [
        ...(props.products.data?.Products?.docs?.length
            ? [
                  {
                      key: "products",
                      label: `Products / Services (${props.products.data.Products.totalDocs ?? 0})`,
                      children: (
                          <List
                              dataSource={props.products.data.Products.docs.slice(0, 3)}
                              rowKey={getSourceQualifiedEntityKey}
                              renderItem={(product) => (
                                  <List.Item>
                                      <List.Item.Meta
                                          title={
                                              <Link to={routes.productsServices.detail.getLink(product as Product)}>
                                                  {product.name}
                                              </Link>
                                          }
                                          description={
                                              <Markdown className="Markdown--clamp2">{product.description}</Markdown>
                                          }
                                      />
                                  </List.Item>
                              )}
                          />
                      ),
                  },
              ]
            : []),
        ...(props.jobs.data?.Jobs?.docs?.length
            ? [
                  {
                      key: "jobs",
                      label: `Jobs (${props.jobs.data.Jobs.totalDocs ?? 0})`,
                      children: (
                          <List
                              dataSource={props.jobs.data.Jobs.docs.slice(0, 3)}
                              rowKey={getSourceQualifiedEntityKey}
                              renderItem={(job) => (
                                  <List.Item>
                                      <List.Item.Meta
                                          title={<Link to={routes.jobs.detail.getLink(job as Job)}>{job.title}</Link>}
                                          description={job.location}
                                      />
                                  </List.Item>
                              )}
                          />
                      ),
                  },
              ]
            : []),
    ];

    return (
        <>
            {(props.products.isError || props.jobs.isError) && (
                <Alert
                    type="warning"
                    showIcon
                    message="Some previews could not load. Open the Products or Jobs tab to retry."
                />
            )}
            {items.length > 0 && (
                <Tabs
                    className="CompanyOverviewListings"
                    type="card"
                    size="small"
                    defaultActiveKey={items[0].key}
                    items={items}
                />
            )}
        </>
    );
};
