import * as React from "react";
import { Button } from "antd";
import type { ButtonProps } from "antd";
import { useHref, useNavigate } from "react-router-dom";
import type { To } from "react-router-dom";

type RouteButtonProps = React.PropsWithChildren<{
    to: To;
    block?: ButtonProps["block"];
    className?: ButtonProps["className"];
    icon?: ButtonProps["icon"];
    iconPosition?: ButtonProps["iconPosition"];
    size?: ButtonProps["size"];
    type?: ButtonProps["type"];
    variant?: ButtonProps["variant"];
    "aria-label"?: string;
}>;

const isModifiedEvent = (event: React.MouseEvent<HTMLElement>) => (
    event.metaKey
    || event.ctrlKey
    || event.button !== 0
);

export const RouteButton: React.FunctionComponent<RouteButtonProps> = ({
    to,
    ...buttonProps
}) => {
    const navigate = useNavigate();
    const href = useHref(to);

    return (
        <Button
            {...buttonProps}
            href={href}
            onClick={(event) => {
                if (isModifiedEvent(event)) {
                    return;
                }

                event.preventDefault();
                navigate(to);
            }}
        />
    );
};
