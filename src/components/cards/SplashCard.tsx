import * as React from "react";

import { Carousel, Grid, Spin, Typography } from "antd";

import type { SplashCardProps } from "./types";

export const SplashCard = <TItem extends { id: string }>(props: SplashCardProps<TItem>) => {
    const screens = Grid.useBreakpoint();
    const slidesToShow = screens.xl ? 3 : screens.md ? 2 : 1.15;

    return (
        <div className={`SplashEntityCard ${props.className}`}>
            <Spin spinning={Boolean(props.loading)} className="SplashEntityCard__spin">
                {props.items.length === 0 ? (
                    <Typography.Text className="SplashEntityCard__empty">
                        {props.emptyText ?? "Coming soon!"}
                    </Typography.Text>
                ) : (
                    <Carousel
                        dots={false}
                        arrows={screens.md}
                        infinite={false}
                        draggable
                        slidesToShow={slidesToShow}
                        slidesToScroll={1}
                        className="SplashEntityCard__carousel"
                        responsive={[
                            {
                                breakpoint: 575,
                                settings: {
                                    slidesToShow: 1.15,
                                    slidesToScroll: 1,
                                    arrows: false,
                                },
                            },
                            {
                                breakpoint: 991,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 1,
                                    arrows: true,
                                },
                            },
                        ]}
                    >
                        {props.items.map((item) => (
                            <div key={item.id} className="SplashEntityCard__carouselSlide">
                                {props.renderItem(item)}
                            </div>
                        ))}
                    </Carousel>
                )}
            </Spin>
        </div>
    );
};
