import type { AppProps } from "next/app";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "@szhsin/react-menu/dist/core.css";
import "react-responsive-modal/styles.css";
import "../../node_modules/@uiw/react-markdown-preview/esm/styles/markdown.css";
import "../../node_modules/@uiw/react-md-editor/esm/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/Toolbar/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/Toolbar/Child.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/TextArea/index.css";
import "../../node_modules/@uiw/react-md-editor/esm/components/DragBar/index.css";
import "../index.scss";
const App = (props: AppProps) => {
    return <props.Component {...props.pageProps} />;
};
export default App;
