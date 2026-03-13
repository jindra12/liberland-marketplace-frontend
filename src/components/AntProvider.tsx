import * as React from "react";
import { ConfigProvider, theme } from "antd";
import { darkToken, darkComponents } from "../darkToken";

export interface ThemeConfigType {
    dark: boolean;
    setDark: (dark: boolean) => void;
}

const ThemeConfig = React.createContext<ThemeConfigType>(null!);

export const useThemeConfig = () => React.useContext(ThemeConfig);

export const AntProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const setDark = React.useCallback((_dark: boolean) => undefined, []);
    return (
        <ThemeConfig.Provider value={{ dark: true, setDark }}>
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: darkToken,
                    components: darkComponents,
                }}
            >
                {props.children}
            </ConfigProvider>
        </ThemeConfig.Provider>
    );
};
