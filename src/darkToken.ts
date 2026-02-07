import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const darkToken: Partial<AliasToken> = {
    colorPrimary: "#00A7D8",
    colorInfo: "#00A7D8",
    colorLink: "#00A7D8",

    colorSuccess: "#14C8A2",
    colorWarning: "#FFC857",
    colorError: "#FF3B6B",

    colorBgLayout: "#02162F",
    colorBgContainer: "#021328",
    colorBgElevated: "#022244",

    colorText: "#F6FBFF",
    colorTextSecondary: "#B8E6F5",
    colorTextTertiary: "#A1ABB6",
    colorTextQuaternary: "#7C8897",

    colorBorder: "#013A6D",
    colorBorderSecondary: "#022A51",
    colorSplit: "#01325F",

    colorFill: "#022A51",
    colorFillSecondary: "#022244",
    colorFillTertiary: "#021C3A",

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

export const darkComponents: { [key in keyof OverrideToken]?: OverrideToken[key] } = {
    Layout: {
        headerBg: "#021328",
        bodyBg: "#02162F",
        siderBg: "#021328",
    },
    Menu: {
        itemBg: "transparent",
        itemSelectedBg: "#022A51",
        itemSelectedColor: "#F6FBFF",
        itemHoverBg: "#022244",
    },
    Card: {
        borderRadiusLG: 18,
    }
};
