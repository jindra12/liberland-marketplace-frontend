import * as React from "react";

import { Button, Empty, Form, Modal, type FormInstance } from "antd";

import { routes } from "../../../routes";
import { EndpointAuthAction } from "../../EndpointAuthAction/EndpointAuthAction";
import type { AddressWithEmail, SubmittedOrder } from "../../order/types";
import type { ProductParameterSource } from "../../productParameters/types";
import { buildProductParameterSelectionMapFromFormValues } from "../../productParameters/utils";
import { RouteButton } from "../../RouteButton";

import { BuyNowCreateOrderStep } from "./BuyNowCreateOrderStep";
import { BuyNowPaymentStep } from "./BuyNowPaymentStep";
import type { BuyNowPreparedPurchase } from "./types";
import { useBuyNowAuthResume } from "./useBuyNowAuthResume";

type BuyNowButtonProps = {
    block?: boolean;
    candidateProfileAddresses: AddressWithEmail[];
    disabled?: boolean;
    form: FormInstance;
    productId: string;
    quantity: number;
    serverURL: string;
    size?: React.ComponentProps<typeof Button>["size"];
    variantId?: string;
    parameters?: ProductParameterSource[] | null;
};

export const BuyNowButton: React.FunctionComponent<BuyNowButtonProps> = (props) => {
    const [preparedPurchase, setPreparedPurchase] = React.useState<BuyNowPreparedPurchase>();
    const [submittedOrders, setSubmittedOrders] = React.useState<SubmittedOrder[]>([]);
    const watchedParameters = Form.useWatch("parameters", props.form);
    const selectedParameterKeys = buildProductParameterSelectionMapFromFormValues(watchedParameters);
    const buyNowAuthResume = useBuyNowAuthResume({
        onResume: () => {
            setPreparedPurchase({
                candidateProfileAddresses: props.candidateProfileAddresses,
            });
        },
    });
    const isBusy = props.disabled || Boolean(preparedPurchase) || submittedOrders.length > 0;
    const handleBuyNow = () => {
        setPreparedPurchase({
            candidateProfileAddresses: props.candidateProfileAddresses,
        });
    };
    const onCancel = () => {
        setPreparedPurchase(undefined);
    };

    return (
        <>
            <EndpointAuthAction defaultAuthUrl={props.serverURL} requireVerifiedEmail>
                {({ runWithAuthOrLogin }) => (
                    <Button
                        block={props.block}
                        type="primary"
                        size={props.size || "large"}
                        disabled={isBusy}
                        onClick={(event) => {
                            event.preventDefault();
                            runWithAuthOrLogin(handleBuyNow, {
                                onUnauthorizedBeforeLogin: buyNowAuthResume.markPendingReturnTo,
                                signinState: buyNowAuthResume.returnTo,
                            });
                        }}
                        className="AddToCartButton__buyNow"
                    >
                        Buy now
                    </Button>
                )}
            </EndpointAuthAction>
            {preparedPurchase && (
                <>
                    {preparedPurchase.candidateProfileAddresses.length === 0 ? (
                        <Modal
                            open
                            destroyOnHidden
                            title="Choose a default shipping address"
                            onCancel={onCancel}
                            footer={[
                                <Button key="cancel" danger onClick={onCancel}>
                                    Cancel
                                </Button>,
                                <RouteButton key="profile" type="primary" to={routes.profile.route}>
                                    Go to profile
                                </RouteButton>,
                            ]}
                            className="BuyNowCreateOrderStep"
                        >
                            <Empty description="No default shipping addresses found" />
                        </Modal>
                    ) : (
                        <BuyNowCreateOrderStep
                            purchase={preparedPurchase}
                            productId={props.productId}
                            quantity={props.quantity}
                            parameters={props.parameters}
                            selectedParameterKeys={selectedParameterKeys}
                            serverURL={props.serverURL}
                            variantId={props.variantId}
                            onCancel={onCancel}
                            onOrderCreated={(submittedOrder) => {
                                setPreparedPurchase(undefined);
                                setSubmittedOrders([submittedOrder]);
                            }}
                        />
                    )}
                </>
            )}
            {submittedOrders.length > 0 && (
                <BuyNowPaymentStep
                    submittedOrders={submittedOrders}
                    onClose={() => {
                        setSubmittedOrders([]);
                    }}
                />
            )}
        </>
    );
};
