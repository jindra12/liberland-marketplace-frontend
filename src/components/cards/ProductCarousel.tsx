import * as React from "react";

import { SplashCard } from "./SplashCard";
import type { SplashCardProps } from "./types";

type ProductCarouselProps<TItem extends { id: string }> = SplashCardProps<TItem> & {
    className?: string;
};

export const ProductCarousel = <TItem extends { id: string }>(props: ProductCarouselProps<TItem>) => {
    return <SplashCard {...props} className={["SplashEntityCard--products", props.className].filter(Boolean).join(" ")} />;
};
