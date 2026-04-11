import * as React from "react";

import { ButtonProps } from "antd";

import { useMeUserQuery } from "../hooks";
import { Loader } from "../Loader";

import { AddToCartButton } from "./AddToCartButton";

type AddToCartButtonContainerProps = {
    productId: string;
    variantId?: string;
    serverURL: string;
    block?: boolean;
    size?: ButtonProps["size"];
    maxAvailable?: number | null;
};

export const AddToCartButtonContainer: React.FunctionComponent<AddToCartButtonContainerProps> = (props) => {
    const me = useMeUserQuery();
    return <Loader query={me}>{(me) => <AddToCartButton {...props} isAuthenticated me={me} />}</Loader>;
};
