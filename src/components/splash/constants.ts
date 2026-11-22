export const MARKET_ACCORDION_POSTS_QUERY_LIMIT = 20;

export const MARKET_ACCORDION_POST_SLICES = [
    { key: "top", offset: 0, limit: 3, className: "MarketAccordion__postSection--top" },
    { key: "firstMiddle", offset: 3, limit: 3, className: "MarketAccordion__postSection--firstMiddle" },
    { key: "secondMiddle", offset: 6, limit: 2, className: "MarketAccordion__postSection--secondMiddle" },
    { key: "thirdMiddle", offset: 8, limit: 4, className: "MarketAccordion__postSection--thirdMiddle" },
    { key: "fourthMiddle", offset: 12, limit: 3, className: "MarketAccordion__postSection--fourthMiddle" },
] as const;
