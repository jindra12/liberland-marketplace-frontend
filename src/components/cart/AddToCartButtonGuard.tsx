import * as React from "react";

import type { ButtonProps } from "antd";

import { AuthGuard } from "../AuthGuard";
import type { ProductParameterSource } from "../productParameters/types";

import { AddToCartButton } from "./AddToCartButton";
import { AddToCartButtonContainer } from "./AddToCartButtonContainer";

type AddToCartButtonGuardProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    hideBuyNowButton?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
    parameters?: ProductParameterSource[] | null;
};

export const AddToCartButtonGuard: React.FunctionComponent<AddToCartButtonGuardProps> = (props) => {
    return (
        <AuthGuard fallback={<AddToCartButton {...props} me={[]} />}>
            <AddToCartButtonContainer {...props} />
        </AuthGuard>
    );
};
