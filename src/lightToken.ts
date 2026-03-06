import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const lightToken: Partial<AliasToken> = {
    colorPrimary: "#0062CC",
    colorInfo: "#0094D4",
    colorLink: "#0062CC",

    colorSuccess: "#0FBE8F",
    colorWarning: "#F5A623",
    colorError: "#EF4565",

    colorBgLayout: "#F5F7FA",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",

    colorText: "#0D1B2A",
    colorTextSecondary: "#3D5A80",
    colorTextTertiary: "#8B9BB4",
    colorTextQuaternary: "#B0BCC9",

    colorBorder: "#D6DEE8",
    colorBorderSecondary: "#E8EDF2",
    colorSplit: "#E8EDF2",

    colorFill: "#E8EDF2",
    colorFillSecondary: "#F0F3F7",
    colorFillTertiary: "#F5F7FA",

    borderRadius: 12,

    fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",

    fontSize: 16,
    fontSizeSM: 14,
    fontSizeLG: 18,
    fontSizeXL: 22,

    fontSizeHeading1: 42,
    fontSizeHeading2: 32,
    fontSizeHeading3: 26,
    fontSizeHeading4: 21,
    fontSizeHeading5: 18,

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

export const lightComponents: { [key in keyof OverrideToken]?: OverrideToken[key] } = {
    Layout: {
        headerBg: "rgba(255, 255, 255, 0.85)",
        bodyBg: "#F5F7FA",
        siderBg: "#FFFFFF",
    },
    Menu: {
        itemBg: "transparent",
        itemSelectedBg: "#E8F0FE",
        itemSelectedColor: "#0062CC",
        itemHoverBg: "#F0F3F7",
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
