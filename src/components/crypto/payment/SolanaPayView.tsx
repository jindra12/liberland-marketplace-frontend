import * as React from "react";

import Flex from "antd/es/flex";

type SolanaPayViewProps = {
    connectButton: React.ReactNode;
    payButton?: React.ReactNode;
    status?: React.ReactNode;
};

export const SolanaPayView: React.FunctionComponent<SolanaPayViewProps> = (props) => {
    return (
        <>
            <Flex wrap gap="15px" justify="center" align="stretch" className="CryptoPaymentGroup">
                {props.payButton}
                {props.connectButton}
            </Flex>
            {props.status}
        </>
    );
};
