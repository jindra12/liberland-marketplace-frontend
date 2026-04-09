import * as React from "react";

import { connectTronWalletStub } from "./state";

export const WalletModalProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return <>{props.children}</>;
};

export const WalletActionButton: React.FunctionComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }
> = (props) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!props.disabled) {
            connectTronWalletStub();
        }

        props.onClick?.(event);
    };

    const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
        className: props.className,
        disabled: props.disabled,
        onBlur: props.onBlur,
        onClick: handleClick,
        onFocus: props.onFocus,
        onKeyDown: props.onKeyDown,
        onKeyUp: props.onKeyUp,
        onMouseDown: props.onMouseDown,
        onMouseEnter: props.onMouseEnter,
        onMouseLeave: props.onMouseLeave,
        onMouseMove: props.onMouseMove,
        onMouseOut: props.onMouseOut,
        onMouseOver: props.onMouseOver,
        onMouseUp: props.onMouseUp,
        onTouchEnd: props.onTouchEnd,
        onTouchMove: props.onTouchMove,
        onTouchStart: props.onTouchStart,
        style: props.style,
        title: props.title,
        type: props.type ?? "button",
    };

    return (
        <button {...buttonProps}>
            {props.children}
        </button>
    );
};
