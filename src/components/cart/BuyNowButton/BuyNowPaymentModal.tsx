import * as React from "react";
import { Button, Modal, Result } from "antd";
import { OrderPaymentStep } from "../../order/OrderPaymentStep";
import type { PaymentProfileUsersByUrl, SubmittedOrder } from "../../order/types";
type BuyNowPaymentModalProps = {
    onAllPaymentsComplete: () => void;
    onCancel: () => void;
    onPaymentWalletRemembered: () => Promise<void>;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    open: boolean;
    paymentComplete: boolean;
    profileUsersByUrl: PaymentProfileUsersByUrl;
    submittedOrders: SubmittedOrder[];
};
export const BuyNowPaymentModal: React.FunctionComponent<BuyNowPaymentModalProps> = (props) => {
    return (
        <Modal open={props.open} destroyOnHidden footer={null} title="Complete payment" onCancel={props.onCancel} className="BuyNowPaymentModal">
            {props.paymentComplete ? (
                <Result
                    status="success"
                    title="Payment submitted"
                    subTitle="Your order has been created and the payment details were sent to the selected wallet."
                    extra={
                        <Button type="primary" onClick={props.onCancel}>
                            Close
                        </Button>
                    }
                />
            ) : (
                <OrderPaymentStep
                    onPaymentWalletRemembered={props.onPaymentWalletRemembered}
                    submittedOrders={props.submittedOrders}
                    onPayerAddressSelected={props.onPayerAddressSelected}
                    onAllPaymentsComplete={props.onAllPaymentsComplete}
                    profileUsersByUrl={props.profileUsersByUrl}
                />
            )}
        </Modal>
    );
};
