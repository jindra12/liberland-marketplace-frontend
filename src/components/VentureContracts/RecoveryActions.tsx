// eslint-disable-next-line no-restricted-syntax -- Use React's runtime default import for namespace types.
import React from "react";

import { Alert, Button, Checkbox, Flex, Modal, Typography } from "antd";

import type { DeploymentRecovery } from "./types";

export interface RecoveryActionsProps {
    record: DeploymentRecovery;
    owned: boolean;
    busy: boolean;
    onAction: (action: "takeover" | "abandon") => void;
}

export const RecoveryActions: React.FunctionComponent<RecoveryActionsProps> = (props) => {
    const [action, setAction] = React.useState<"takeover" | "abandon" | null>(null);
    const [confirmed, setConfirmed] = React.useState(false);
    const openAction = (next: "takeover" | "abandon") => {
        setConfirmed(false);
        setAction(next);
    };
    return (
        <Flex gap={12} wrap>
            <Button
                download="venture-recovery.json"
                href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(props.record, null, 2))}`}
            >
                Download recovery journal
            </Button>
            {!props.owned && (
                <Button disabled={props.busy} onClick={() => openAction("takeover")}>
                    Take over recovery
                </Button>
            )}
            <Button danger disabled={props.busy} onClick={() => openAction("abandon")}>
                Archive abandoned deployment
            </Button>
            <Modal
                open={Boolean(action)}
                title={action === "takeover" ? "Take over deployment recovery?" : "Archive this deployment?"}
                cancelText="Keep recovery unchanged"
                okText={action === "takeover" ? "Confirm takeover" : "Confirm archive"}
                okButtonProps={{ disabled: !confirmed, danger: action === "abandon" }}
                onCancel={() => setAction(null)}
                onOk={() => {
                    props.onAction(action!);
                    setAction(null);
                }}
            >
                <Flex vertical gap={16}>
                    <Alert
                        type="warning"
                        showIcon
                        message="Reconcile every pending transaction"
                        description="Stop every other deployment session and close outstanding wallet prompts first. Inspect submitted hashes and wallet nonces, including replaced or cancelled transactions. A transaction already signed or broadcast cannot be revoked by this action."
                    />
                    <Typography.Paragraph>
                        Archiving preserves the backend journal, but does not undo deployed contracts or recover spent
                        gas. Download the journal before continuing. Do not start another deployment while any
                        transaction is unresolved.
                    </Typography.Paragraph>
                    <Checkbox checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}>
                        I stopped every runner and reconciled all transactions.
                    </Checkbox>
                </Flex>
            </Modal>
        </Flex>
    );
};
