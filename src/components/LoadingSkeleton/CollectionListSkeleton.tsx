import * as React from "react";
import { Flex, Skeleton } from "antd";
import { collectionCards } from "./SkeletonConfig";

export const CollectionListSkeleton: React.FunctionComponent = () => (
    <div className="LoadingSkeleton LoadingSkeleton--collection">
        <div className="LoadingSkeleton__surfaceHeader">
            <div className="LoadingSkeleton__surfaceTitle">
                <Skeleton.Input active block size="large" />
            </div>
            <div className="LoadingSkeleton__surfaceFilters">
                <Skeleton.Button active block size="large" />
            </div>
        </div>
        <div className="LoadingSkeleton__collectionGrid">
            {collectionCards.map((_, index) => (
                <div key={`collection-card-${index}`} className="LoadingSkeleton__collectionCard">
                    <Flex gap={18} align="flex-start">
                        <Skeleton.Avatar active size={72} shape="square" />
                        <div className="LoadingSkeleton__collectionCardBody">
                            <Skeleton active paragraph={{ rows: 3 }} title={{ width: "58%" }} />
                        </div>
                    </Flex>
                </div>
            ))}
        </div>
    </div>
);
