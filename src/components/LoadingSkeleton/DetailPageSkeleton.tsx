import * as React from "react";

import { Flex, Skeleton } from "antd";

import { collectionCards, summaryCards } from "./SkeletonConfig";

export const DetailPageSkeleton: React.FunctionComponent = () => (
    <div className="LoadingSkeleton LoadingSkeleton--detail">
        <div className="LoadingSkeleton__detailHeader">
            <Skeleton.Avatar active size={112} shape="circle" />
            <div className="LoadingSkeleton__detailHeaderBody">
                <div className="LoadingSkeleton__detailTitle">
                    <Skeleton.Input active block size="large" />
                </div>
                <div className="LoadingSkeleton__detailMeta">
                    <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </div>
            </div>
        </div>
        <div className="LoadingSkeleton__detailBlock">
            <Skeleton active paragraph={{ rows: 5 }} title={{ width: "36%" }} />
        </div>
        <div className="LoadingSkeleton__detailTabs">
            {summaryCards.slice(0, 4).map((_, index) => (
                <div key={`detail-tab-${index}`} className="LoadingSkeleton__detailTab">
                    <Skeleton.Button active block size="small" />
                </div>
            ))}
        </div>
        <div className="LoadingSkeleton__collectionGrid">
            {collectionCards.map((_, index) => (
                <div key={`detail-card-${index}`} className="LoadingSkeleton__collectionCard">
                    <Flex gap={18} align="flex-start">
                        <Skeleton.Avatar active size={72} shape="square" />
                        <div className="LoadingSkeleton__collectionCardBody">
                            <Skeleton active paragraph={{ rows: 3 }} title={{ width: "62%" }} />
                        </div>
                    </Flex>
                </div>
            ))}
        </div>
    </div>
);
