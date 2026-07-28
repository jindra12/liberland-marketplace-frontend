import * as React from "react";

import { Carousel, Flex, Grid, Spin } from "antd";

import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

import type { SplashCardProps } from "./types";

export const SplashCard = <TItem extends { id: string }>(props: SplashCardProps<TItem>) => {
    const screens = Grid.useBreakpoint();
    const slidesToShow = screens.xl ? 3 : 2;

    return (
        <div className={`SplashEntityCard ${props.className}`}>
            <Spin spinning={Boolean(props.loading)} className="SplashEntityCard__spin">
                {props.items.length === 0 ? null : !screens.md ? (
                    <Flex vertical gap={12} className="SplashEntityCard__stack">
                        {props.items.slice(0, 5).map((item) => (
                            <AnimatedIn key={item.id} className="SplashEntityCard__stackItem">
                                {props.renderItem(item)}
                            </AnimatedIn>
                        ))}
                    </Flex>
                ) : (
                    <Carousel
                        dots={false}
                        arrows={screens.md}
                        autoplay={screens.md}
                        autoplaySpeed={4800}
                        draggable
                        pauseOnHover
                        speed={700}
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
                            <AnimatedIn key={item.id} className="SplashEntityCard__carouselSlide">
                                {props.renderItem(item)}
                            </AnimatedIn>
                        ))}
                    </Carousel>
                )}
            </Spin>
        </div>
    );
};
