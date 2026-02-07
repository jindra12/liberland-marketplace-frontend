import * as React from "react";
import { ConfigProvider, theme } from "antd";
import { darkToken, darkComponents } from "../darkToken";
import { lightComponents, lightToken } from "../lightToken";

export interface ThemeConfigType {
    dark: boolean;
    setDark: (dark: boolean) => void;
}

const ThemeConfig = React.createContext<ThemeConfigType>(null!);

export const useThemeConfig = () => React.useContext(ThemeConfig);

export const AntProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [dark, setDark] = React.useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
    return (
        <ThemeConfig.Provider value={{ dark, setDark }}>
            <ConfigProvider
                theme={{
                    algorithm: [theme.darkAlgorithm, dark ? theme.compactAlgorithm : theme.defaultAlgorithm],
                    token: dark ? darkToken : lightToken,
                    components: dark ? darkComponents : lightComponents
                }}
            >
                {props.children}
            </ConfigProvider>
        </ThemeConfig.Provider>
    );
};