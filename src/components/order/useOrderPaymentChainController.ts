import * as React from "react";

import { message } from "antd";

import { useUpdateOrderMutation, useUpdateUserByIdMutation } from "../hooks";

import {
    appendPaymentWalletSelection,
    appendTransactionHashRows,
    collectProductIdsForChain,
    hasPaymentWalletSelection,
    toExistingTransactionHashRows,
    toUserUpdateWalletInputs,
    type ChainPaymentAmount,
} from "./payment/utils";
import type {
    PaymentProfileUser,
    PaymentWalletSelection,
    SubmittedOrder,
} from "./types";

type OrderPaymentChainControllerProps = {
    chainPayment: ChainPaymentAmount;
    entry: SubmittedOrder;
    onEntryUpdated: (entry: SubmittedOrder) => void;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onPaymentCompleted: (paymentKey: string) => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    paymentKey: string;
    profileUser?: PaymentProfileUser;
};

type OrderPaymentChainControllerState = {
    addedWallets: PaymentWalletSelection[];
    isPaymentCompleted: boolean;
    rememberWallet: boolean;
    selectedWallet?: PaymentWalletSelection;
};

type OrderPaymentChainControllerAction =
    | {
          type: "addWallet";
          selection: PaymentWalletSelection;
      }
    | {
          type: "completePayment";
      }
    | {
          type: "setRememberWallet";
          value: boolean;
      }
    | {
          type: "selectWallet";
          selection: PaymentWalletSelection;
      };

const orderPaymentChainControllerReducer = (
    state: OrderPaymentChainControllerState,
    action: OrderPaymentChainControllerAction,
): OrderPaymentChainControllerState => {
    if (action.type === "addWallet") {
        return {
            ...state,
            addedWallets: appendPaymentWalletSelection(state.addedWallets, action.selection),
        };
    }

    if (action.type === "completePayment") {
        return {
            ...state,
            isPaymentCompleted: true,
        };
    }

    if (action.type === "setRememberWallet") {
        return {
            ...state,
            rememberWallet: action.value,
        };
    }

    if (action.type === "selectWallet") {
        const hasSameSelection =
            state.selectedWallet?.address === action.selection.address &&
            state.selectedWallet?.chain === action.selection.chain &&
            state.selectedWallet?.provider === action.selection.provider;

        if (hasSameSelection) {
            return state;
        }

        return {
            ...state,
            rememberWallet: false,
            selectedWallet: action.selection,
        };
    }

    return state;
};

export const useOrderPaymentChainController = (props: OrderPaymentChainControllerProps) => {
    const updateOrderMutation = useUpdateOrderMutation();
    const updateUserMutation = useUpdateUserByIdMutation();
    const [state, dispatch] = React.useReducer(orderPaymentChainControllerReducer, {
        addedWallets: [],
        isPaymentCompleted: false,
        rememberWallet: false,
        selectedWallet: undefined,
    });
    const availableWallets = (props.profileUser?.wallets ?? []).reduce<PaymentWalletSelection[]>(
        (wallets, wallet) => {
            return appendPaymentWalletSelection(wallets, wallet);
        },
        state.addedWallets,
    );

    const saveTransactionHash = async (txHash: string): Promise<boolean> => {
        const productIds = collectProductIdsForChain(props.entry.order, props.chainPayment.chain);
        const existingRows = toExistingTransactionHashRows(props.entry.order);
        const { nextRows } = appendTransactionHashRows({
            existingRows,
            productIds,
            chain: props.chainPayment.chain,
            txHash,
        });

        try {
            const result = await updateOrderMutation.mutateAsync({
                url: props.entry.url,
                orderId: props.entry.order.id,
                draft: false,
                data: {
                    transactionHashes: nextRows,
                },
            });
            const updatedOrder = result.updateOrder;

            if (updatedOrder?.id) {
                props.onEntryUpdated({
                    url: props.entry.url,
                    order: updatedOrder as SubmittedOrder["order"],
                });
            }

            message.success(`Saved transaction hash for order ${props.entry.order.id}`);
            return true;
        } catch (error) {
            console.error(error);
            message.error(`Could not save transaction hash for order ${props.entry.order.id}`);
            return false;
        }
    };

    const rememberSelectedWallet = async () => {
        if (!state.rememberWallet || !state.selectedWallet || !props.profileUser) {
            return;
        }

        if (hasPaymentWalletSelection(availableWallets, state.selectedWallet)) {
            return;
        }

        const nextWallets = appendPaymentWalletSelection(availableWallets, state.selectedWallet);

        try {
            await updateUserMutation.mutateAsync({
                url: props.entry.url,
                id: props.profileUser.id,
                data: {
                    wallets: toUserUpdateWalletInputs(nextWallets),
                },
            });

            dispatch({
                type: "addWallet",
                selection: state.selectedWallet,
            });
            dispatch({
                type: "setRememberWallet",
                value: false,
            });
            message.success("Wallet saved for future payments");
            await props.onPaymentWalletRemembered?.();
        } catch (error) {
            console.error(error);
            message.error("Could not save wallet for future payments");
        }
    };

    const handleTransactionId = async (txHash: string) => {
        const isSaved = await saveTransactionHash(txHash);

        if (!isSaved) {
            return;
        }

        await rememberSelectedWallet();
        dispatch({
            type: "completePayment",
        });
        props.onPaymentCompleted(props.paymentKey);
    };

    const handleWalletSelected = async (selection: PaymentWalletSelection) => {
        dispatch({
            type: "selectWallet",
            selection,
        });
        await props.onPayerAddressSelected(props.entry, selection.address);
    };

    return {
        handleTransactionId,
        handleWalletSelected,
        isPaymentCompleted: state.isPaymentCompleted,
        isSavingWallet: updateUserMutation.isPending,
        rememberWallet: state.rememberWallet,
        setRememberWallet: (value: boolean) => {
            dispatch({
                type: "setRememberWallet",
                value,
            });
        },
        showRememberWallet: Boolean(
            state.selectedWallet &&
                props.profileUser &&
                !hasPaymentWalletSelection(availableWallets, state.selectedWallet),
        ),
    };
};
