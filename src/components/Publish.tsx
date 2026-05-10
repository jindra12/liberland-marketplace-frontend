import * as React from "react";

import { usePermissionsContext } from "./PermissionsContext";
import { PublishSelectionFlow } from "./publish/PublishSelectionFlow";

const Publish: React.FunctionComponent = () => {
    const { canCreateContent } = usePermissionsContext();

    return <PublishSelectionFlow canCreateContent={canCreateContent} />;
};

export default Publish;
