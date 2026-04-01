import * as React from "react";
import { Button, Modal, Result } from "antd";
import { OrderPaymentStep } from "../../order/OrderPaymentStep";
import type { SubmittedOrder } from "../../order/types";

type BuyNowPaymentModalProps = {
    onAllPaymentsComplete: () => void;
    onCancel: () => void;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    open: boolean;
    paymentComplete: boolean;
    submittedOrders: SubmittedOrder[];
};

export const BuyNowPaymentModal: React.FunctionComponent<BuyNowPaymentModalProps> = ({
    onAllPaymentsComplete,
    onCancel,
    onPayerAddressSelected,
    open,
    paymentComplete,
    submittedOrders,
}) => {
    return (
        <Modal
            open={open}
            destroyOnHidden
            footer={null}
            title="Complete payment"
            onCancel={onCancel}
            className="BuyNowPaymentModal"
        >
            {paymentComplete ? (
                <Result
                    status="success"
                    title="Payment submitted"
                    subTitle="Your order has been created and the payment details were sent to the selected wallet."
                    extra={(
                        <Button type="primary" onClick={onCancel}>
                            Close
                        </Button>
                    )}
                />
            ) : (
                <OrderPaymentStep
                    submittedOrders={submittedOrders}
                    onPayerAddressSelected={onPayerAddressSelected}
                    onAllPaymentsComplete={onAllPaymentsComplete}
                />
            )}
        </Modal>
    );
};
