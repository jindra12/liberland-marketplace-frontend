import * as React from "react";
import type { ButtonProps } from "antd";
import { AuthGuard } from "../AuthGuard";
import { AddToCartButtonContainer } from "./AddToCartButtonContainer";
import { AddToCartButton } from "./AddToCartButton";

type AddToCartButtonGuardProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
};

export const AddToCartButtonGuard: React.FunctionComponent<AddToCartButtonGuardProps> = (props) => {
    return (
        <AuthGuard fallback={<AddToCartButton {...props} me={[]} />}>
            <AddToCartButtonContainer {...props} />
        </AuthGuard>
    )
};
