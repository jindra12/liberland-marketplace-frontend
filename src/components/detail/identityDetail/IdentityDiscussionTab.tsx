import * as React from "react";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../../generated/graphql";
import { EntityCommentsSection } from "../../comments/EntityCommentsSection";

import type { IdentityDetailTabProps } from "./types";

export const IdentityDiscussionTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    return (
        <EntityCommentsSection
            targetId={props.identityId}
            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Identities}
            serverURL={props.serverURL}
        />
    );
};
