import * as React from "react";

import Flex from "antd/es/flex";

type TronPaymentButtonViewProps = {
    connectButton: React.ReactNode;
    payButton?: React.ReactNode;
    status?: React.ReactNode;
};

export const TronPaymentButtonView: React.FunctionComponent<TronPaymentButtonViewProps> = (props) => {
    return (
        <>
            <Flex
                wrap
                gap="15px"
                justify="center"
                align="stretch"
                flex={1}
                className="CryptoPaymentGroup TronwebModal TronwebModal--payment"
            >
                {props.payButton}
                {props.connectButton}
            </Flex>
            {props.status}
        </>
    );
};
