import * as React from "react";

import { useEndpointContext } from "./EndpointContext";
import { PublishContent } from "./publish/PublishContent";

const Publish: React.FunctionComponent = () => {
    const { authUrl } = useEndpointContext();

    return <PublishContent url={authUrl} />;
};

export default Publish;
