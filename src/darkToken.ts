import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const darkToken: Partial<AliasToken> = {
    colorPrimary: "#5AA6FF",
    colorInfo: "#5AA6FF",
    colorLink: "#79E6B1",

    colorSuccess: "#79E6B1",
    colorWarning: "#FFC857",
    colorError: "#FF3B6B",

    colorBgLayout: "#030D17",
    colorBgContainer: "#061423",
    colorBgElevated: "#081B2E",

    colorText: "#EEF8F3",
    colorTextSecondary: "#BCD9CB",
    colorTextTertiary: "#8FA99D",
    colorTextQuaternary: "#6E857B",

    colorBorder: "#14304A",
    colorBorderSecondary: "#0E2437",
    colorSplit: "#123149",

    colorFill: "#0A1E31",
    colorFillSecondary: "#081B2D",
    colorFillTertiary: "#061628",

    borderRadius: 18,

    fontFamily:
        "\"Montserrat\", \"Segoe UI\", Helvetica, Arial, sans-serif",

    fontSize: 18,
    fontSizeSM: 16,
    fontSizeLG: 21,
    fontSizeXL: 24,

    fontSizeHeading1: 52,
    fontSizeHeading2: 40,
    fontSizeHeading3: 32,
    fontSizeHeading4: 28,
    fontSizeHeading5: 24,

    lineHeight: 1.5,
    lineHeightSM: 1.45,
    lineHeightLG: 1.55,

    lineHeightHeading1: 1.02,
    lineHeightHeading2: 1.12,
    lineHeightHeading3: 1.14,
    lineHeightHeading4: 1.2,
    lineHeightHeading5: 1.25,

    controlHeight: 44,
    controlHeightSM: 36,
    controlHeightLG: 52,
};

export const darkComponents: { [key in keyof OverrideToken]?: OverrideToken[key] } = {
    Layout: {
        headerBg: "transparent",
        bodyBg: "#030D17",
        siderBg: "#061423",
    },
    Menu: {
        itemBg: "transparent",
        itemColor: "#D9EEE5",
        itemHoverColor: "#EEF8F3",
        itemHoverBg: "rgba(9, 27, 44, 0.85)",
        itemSelectedBg: "rgba(10, 31, 49, 0.92)",
        itemSelectedColor: "#EEF8F3",
        horizontalItemSelectedColor: "#EEF8F3",
        horizontalItemHoverColor: "#EEF8F3",
    },
    Card: {
        borderRadiusLG: 24,
        headerBg: "transparent",
        colorBorderSecondary: "#14304A",
        bodyPadding: 24,
        headerPadding: 20,
    },
    Button: {
        fontWeight: 800,
        controlHeightLG: 52,
        paddingInlineLG: 22,
        borderRadius: 999,
        defaultBg: "rgba(4, 17, 30, 0.82)",
        defaultBorderColor: "#14304A",
        defaultColor: "#EEF8F3",
        defaultHoverBg: "rgba(7, 24, 40, 0.94)",
        defaultHoverBorderColor: "#1E466C",
        defaultHoverColor: "#EEF8F3",
        primaryColor: "#03121D",
        primaryShadow: "0 18px 36px rgba(47, 140, 255, 0.22)",
    },
    Drawer: {
        colorBgElevated: "#071625",
    },
    Input: {
        colorBgContainer: "rgba(6, 20, 35, 0.9)",
        colorBorder: "#14304A",
        colorTextPlaceholder: "#8FA99D",
        activeBorderColor: "#5AA6FF",
        hoverBorderColor: "#2F8CFF",
    },
    Select: {
        colorBgContainer: "rgba(6, 20, 35, 0.9)",
        colorBorder: "#14304A",
        optionSelectedBg: "rgba(10, 31, 49, 0.92)",
    },
    Tag: {
        defaultBg: "rgba(8, 25, 39, 0.82)",
        defaultColor: "#BCD9CB",
        colorBorder: "#14304A",
    },
    List: {
        titleMarginBottom: 2,
    },
};
