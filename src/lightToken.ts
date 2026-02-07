import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const lightToken: Partial<AliasToken> = {
    colorPrimary: "#0066B8",
    colorInfo: "#00A7D8",
    colorLink: "#0066B8",

    colorSuccess: "#14C8A2",
    colorWarning: "#FFC857",
    colorError: "#FF3B6B",

    colorBgLayout: "#F9FCFF",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",

    colorText: "#02162F",
    colorTextSecondary: "#01325F",
    colorTextTertiary: "#747F8D",
    colorTextQuaternary: "#A6ADB6",

    colorBorder: "#B8D6ED",
    colorBorderSecondary: "#D9E8F4",
    colorSplit: "#D9E8F4",

    colorFill: "#E6F0F8",
    colorFillSecondary: "#F2F7FB",
    colorFillTertiary: "#F7FAFD",

    borderRadius: 14,

    fontFamily:
        "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",

    fontSize: 17,
    fontSizeSM: 15,
    fontSizeLG: 19,
    fontSizeXL: 22,

    fontSizeHeading1: 44,
    fontSizeHeading2: 34,
    fontSizeHeading3: 28,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,

    lineHeight: 1.5,
    lineHeightSM: 1.45,
    lineHeightLG: 1.55,

    lineHeightHeading1: 1.1,
    lineHeightHeading2: 1.12,
    lineHeightHeading3: 1.18,
    lineHeightHeading4: 1.2,
    lineHeightHeading5: 1.25,

    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,
};

export const lightComponents: { [key in keyof OverrideToken]?: OverrideToken[key] } = {
    Layout: {
        headerBg: "#FFFFFF",
        bodyBg: "#F9FCFF",
        siderBg: "#FFFFFF",
    },
    Menu: {
        itemBg: "transparent",
        itemSelectedBg: "#E6F0F8",
        itemSelectedColor: "#0066B8",
        itemHoverBg: "#F2F7FB",
    },
    Card: {
        borderRadiusLG: 18,
    },
};
