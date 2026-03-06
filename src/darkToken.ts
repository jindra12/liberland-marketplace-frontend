import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const darkToken: Partial<AliasToken> = {
    colorPrimary: "#3DA9FC",
    colorInfo: "#3DA9FC",
    colorLink: "#3DA9FC",

    colorSuccess: "#2ECC87",
    colorWarning: "#F5A623",
    colorError: "#EF4565",

    colorBgLayout: "#0B1622",
    colorBgContainer: "#111D2E",
    colorBgElevated: "#162536",

    colorText: "#E8F1FA",
    colorTextSecondary: "#94A3B8",
    colorTextTertiary: "#6B7B8F",
    colorTextQuaternary: "#4A5568",

    colorBorder: "#1E3048",
    colorBorderSecondary: "#172738",
    colorSplit: "#1E3048",

    colorFill: "#1A2B3E",
    colorFillSecondary: "#162536",
    colorFillTertiary: "#111D2E",

    borderRadius: 12,

    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",

    fontSize: 15,
    fontSizeSM: 13,
    fontSizeLG: 17,
    fontSizeXL: 20,

    fontSizeHeading1: 40,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 17,

    lineHeight: 1.6,
    lineHeightSM: 1.5,
    lineHeightLG: 1.6,

    lineHeightHeading1: 1.15,
    lineHeightHeading2: 1.2,
    lineHeightHeading3: 1.25,
    lineHeightHeading4: 1.3,
    lineHeightHeading5: 1.35,

    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,
};

export const darkComponents: { [key in keyof OverrideToken]?: OverrideToken[key] } = {
    Layout: {
        headerBg: "rgba(11, 22, 34, 0.85)",
        bodyBg: "#0B1622",
        siderBg: "#111D2E",
    },
    Menu: {
        itemBg: "transparent",
        itemSelectedBg: "#1A2B3E",
        itemSelectedColor: "#3DA9FC",
        itemHoverBg: "#162536",
    },
    Card: {
        borderRadiusLG: 16,
    },
    Button: {
        borderRadius: 10,
        borderRadiusLG: 12,
        borderRadiusSM: 8,
    },
    List: {
        titleMarginBottom: 2,
    },
};
