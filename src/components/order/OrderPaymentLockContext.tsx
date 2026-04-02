import * as React from "react";

type OrderPaymentLockContextValue = {
    isPaymentPending: boolean;
    setIsPaymentPending: React.Dispatch<React.SetStateAction<boolean>>;
};

const OrderPaymentLockContext = React.createContext<OrderPaymentLockContextValue | null>(null);

export const OrderPaymentLockProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [isPaymentPending, setIsPaymentPending] = React.useState(false);

    const contextValue = React.useMemo<OrderPaymentLockContextValue>(
        () => ({
            isPaymentPending,
            setIsPaymentPending,
        }),
        [isPaymentPending],
    );

    return <OrderPaymentLockContext.Provider value={contextValue}>{props.children}</OrderPaymentLockContext.Provider>;
};

export const useOrderPaymentLockContext = (): OrderPaymentLockContextValue => {
    const context = React.useContext(OrderPaymentLockContext);
    if (!context) {
        throw new Error("useOrderPaymentLockContext must be used within OrderPaymentLockProvider");
    }
    return context;
};
