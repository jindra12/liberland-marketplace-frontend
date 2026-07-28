import Analytics from "analytics";

export const appAnalytics = Analytics({
    app: "nswap-marketplace",
    debug: process.env.NODE_ENV !== "production",
});
