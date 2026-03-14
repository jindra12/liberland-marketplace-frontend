import * as React from "react";
import { Skeleton } from "antd";
import { summaryCards } from "./SkeletonConfig";

export const AppBootSkeleton: React.FunctionComponent = () => (
    <div className="LoadingSkeleton LoadingSkeleton--boot">
        <div className="LoadingSkeleton__appShell">
            <div className="LoadingSkeleton__headerShell">
                <Skeleton.Avatar active size={40} shape="circle" />
                <div className="LoadingSkeleton__headerBrand">
                    <Skeleton.Input active block size="small" />
                </div>
                <div className="LoadingSkeleton__headerMenu">
                    {summaryCards.map((_, index) => (
                        <div key={`boot-menu-${index}`} className="LoadingSkeleton__headerMenuItem">
                            <Skeleton.Button active block size="small" />
                        </div>
                    ))}
                </div>
                <div className="LoadingSkeleton__headerActions">
                    <div className="LoadingSkeleton__headerAction">
                        <Skeleton.Button active block size="small" />
                    </div>
                    <div className="LoadingSkeleton__headerAction LoadingSkeleton__headerAction--primary">
                        <Skeleton.Button active block size="large" />
                    </div>
                </div>
            </div>

            <div className="LoadingSkeleton__heroShell">
                <div className="LoadingSkeleton__eyebrow">
                    <Skeleton.Button active block size="small" />
                </div>
                <div className="LoadingSkeleton__heroTitle">
                    <Skeleton.Input active block size="large" />
                </div>
                <div className="LoadingSkeleton__heroTitle LoadingSkeleton__heroTitle--secondary">
                    <Skeleton.Input active block size="large" />
                </div>
                <div className="LoadingSkeleton__heroCopy">
                    <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </div>
                <div className="LoadingSkeleton__heroActions">
                    <div className="LoadingSkeleton__heroAction">
                        <Skeleton.Button active block size="large" />
                    </div>
                    <div className="LoadingSkeleton__heroAction">
                        <Skeleton.Button active block size="large" />
                    </div>
                </div>
                <div className="LoadingSkeleton__summaryGrid">
                    {summaryCards.map((_, index) => (
                        <div key={`boot-card-${index}`} className="LoadingSkeleton__summaryCard">
                            <Skeleton active paragraph={{ rows: 2 }} title={{ width: "78%" }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
