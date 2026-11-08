// eslint-disable-next-line no-restricted-syntax -- Use React's runtime default import for namespace types.
import React from "react";

import { useBlocker } from "react-router-dom";

import { Modal } from "antd";
import type { FormInstance } from "antd";

export interface RouteNavigationGuardProps {
    form: FormInstance;
}

export const RouteNavigationGuard: React.FunctionComponent<RouteNavigationGuardProps> = (props) => {
    const blocker = useBlocker(() => props.form.isFieldsTouched());
    return (
        <Modal
            open={blocker.state === "blocked"}
            title="Discard unsaved changes?"
            okText="Discard changes"
            cancelText="Keep editing"
            onCancel={() => blocker.reset?.()}
            onOk={() => blocker.proceed?.()}
        >
            Your changes have not been saved. Leaving this page will discard them.
        </Modal>
    );
};
