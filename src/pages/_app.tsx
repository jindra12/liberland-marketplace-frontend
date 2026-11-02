import type { AppProps } from "next/app";
import { DiscoveryGuide } from "../aiDiscovery/DiscoveryGuide";
import { WebMcpRegistration } from "../agentDiscovery/WebMcpRegistration";
import { AntProvider } from "../components/AntProvider";
import "../../node_modules/@uiw/react-markdown-preview/esm/styles/markdown.css";
import "../../node_modules/@uiw/react-md-editor/esm/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/Toolbar/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/Toolbar/Child.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/TextArea/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/DragBar/index.css";
import "../index.scss";
const App = (props: AppProps) => {
    return (
        <>
            <DiscoveryGuide />
            <AntProvider>
                <WebMcpRegistration />
            </AntProvider>
            <props.Component {...props.pageProps} />
        </>
    );
};
export default App;
