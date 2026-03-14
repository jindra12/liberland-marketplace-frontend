import { OverrideToken } from "antd/es/theme/interface";
import { AliasToken } from "antd/es/theme/internal";

export const darkToken: Partial<AliasToken> = {
    colorPrimary: "#5AA6FF",
    colorInfo: "#5AA6FF",
    colorLink: "#79E6B1",

    colorSuccess: "#79E6B1",
    colorWarning: "#FFC857",
    colorError: "#FF3B6B",

    colorBgLayout: "#01060D",
    colorBgContainer: "#04101A",
    colorBgElevated: "#051522",

    colorText: "#EEF8F3",
    colorTextSecondary: "#BCD9CB",
    colorTextTertiary: "#8FA99D",
    colorTextQuaternary: "#6E857B",

    colorBorder: "rgba(25, 57, 82, 0.5)",
    colorBorderSecondary: "rgba(18, 40, 58, 0.32)",
    colorSplit: "rgba(22, 50, 72, 0.32)",

    colorFill: "#081625",
    colorFillSecondary: "#061321",
    colorFillTertiary: "#04101B",

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
        bodyBg: "#01060D",
        siderBg: "#04101A",
    },
    Menu: {
        itemBg: "transparent",
        itemColor: "#D9EEE5",
        itemHoverColor: "#EEF8F3",
        itemHoverBg: "rgba(9, 27, 44, 0.56)",
        itemSelectedBg: "rgba(10, 31, 49, 0.72)",
        itemSelectedColor: "#EEF8F3",
        horizontalItemSelectedColor: "#EEF8F3",
        horizontalItemHoverColor: "#EEF8F3",
        popupBg: "#05131F",
    },
    Card: {
        borderRadiusLG: 24,
        headerBg: "transparent",
        colorBorderSecondary: "rgba(31, 67, 96, 0.28)",
        bodyPadding: 24,
        headerPadding: 20,
    },
    Button: {
        fontWeight: 800,
        controlHeightLG: 52,
        paddingInline: 20,
        paddingInlineLG: 20,
        paddingInlineSM: 20,
        borderRadius: 999,
        borderRadiusLG: 999,
        borderRadiusSM: 999,
        defaultBg: "rgba(3, 14, 24, 0.9)",
        defaultBorderColor: "rgba(24, 56, 82, 0.34)",
        defaultColor: "#EEF8F3",
        defaultHoverBg: "rgba(5, 18, 31, 0.96)",
        defaultHoverBorderColor: "rgba(37, 77, 110, 0.46)",
        defaultHoverColor: "#EEF8F3",
        primaryColor: "#03121D",
        primaryShadow: "0 18px 36px rgba(47, 140, 255, 0.22)",
    },
    Drawer: {
        colorBgElevated: "#05131F",
    },
    Dropdown: {
        colorBgElevated: "#05131F",
    },
    Input: {
        colorBgContainer: "rgba(4, 15, 26, 0.94)",
        colorBorder: "rgba(24, 56, 82, 0.4)",
        colorTextPlaceholder: "#8FA99D",
        activeBorderColor: "#5AA6FF",
        hoverBorderColor: "#2F8CFF",
    },
    Select: {
        colorBgContainer: "rgba(4, 15, 26, 0.94)",
        colorBorder: "rgba(24, 56, 82, 0.4)",
        optionSelectedBg: "rgba(10, 31, 49, 0.92)",
    },
    Tag: {
        defaultBg: "rgba(6, 18, 29, 0.86)",
        defaultColor: "#BCD9CB",
        colorBorder: "rgba(24, 56, 82, 0.34)",
    },
    List: {
        titleMarginBottom: 2,
    },
};
