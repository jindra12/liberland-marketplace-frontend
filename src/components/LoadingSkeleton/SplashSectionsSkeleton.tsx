import * as React from "react";
import { Flex, Skeleton } from "antd";
import { collectionCards, tribeCards } from "./SkeletonConfig";

export const SplashSectionsSkeleton: React.FunctionComponent = () => (
    <div className="LoadingSkeleton LoadingSkeleton--splashSections">
        {tribeCards.map((_, index) => (
            <div key={`splash-section-${index}`} className="LoadingSkeleton__tribeSection">
                <Flex gap={14} align="center" className="LoadingSkeleton__tribeHeader">
                    <Skeleton.Avatar active size={48} shape="circle" />
                    <div className="LoadingSkeleton__tribeHeaderBody">
                        <Skeleton.Input active block size="default" />
                        <Skeleton.Input active block size="small" />
                    </div>
                </Flex>
                <div className="LoadingSkeleton__tribeGrid">
                    {collectionCards.concat([null]).map((__, cardIndex) => (
                        <div key={`splash-card-${index}-${cardIndex}`} className="LoadingSkeleton__tribeCard">
                            <Skeleton active paragraph={{ rows: 3 }} title={{ width: "54%" }} />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);
