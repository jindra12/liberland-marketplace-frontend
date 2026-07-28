import * as React from "react";

import Flex from "antd/es/flex";

type ThirdwebPayButtonViewProps = {
    connectButton: React.ReactNode;
    payButton?: React.ReactNode;
    status?: React.ReactNode;
};

export const ThirdwebPayButtonView: React.FunctionComponent<ThirdwebPayButtonViewProps> = (props) => {
    return (
        <>
            <Flex wrap gap="15px" justify="center" align="stretch" flex={1} className="CryptoPaymentGroup">
                {props.connectButton}
                {props.payButton}
            </Flex>
            {props.status}
        </>
    );
};
