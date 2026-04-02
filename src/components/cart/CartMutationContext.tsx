import * as React from "react";

type CartMutationContextValue = {
    isMutating: boolean;
    setIsMutating: React.Dispatch<React.SetStateAction<boolean>>;
};

const CartMutationContext = React.createContext<CartMutationContextValue | null>(null);

export const CartMutationProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [isMutating, setIsMutating] = React.useState(false);

    const contextValue = React.useMemo<CartMutationContextValue>(
        () => ({
            isMutating,
            setIsMutating,
        }),
        [isMutating],
    );

    return <CartMutationContext.Provider value={contextValue}>{props.children}</CartMutationContext.Provider>;
};

export const useCartMutationContext = (): CartMutationContextValue => {
    const context = React.useContext(CartMutationContext);
    if (!context) {
        throw new Error("useCartMutationContext must be used within CartMutationProvider");
    }
    return context;
};
