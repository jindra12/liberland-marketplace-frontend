import React, { useEffect } from "react";
import type {} from "webmcp-types";
import { Modal } from "antd";
import { registerMarketplaceTools } from "./webmcp/utils";
import { confirmWebMcpTool } from "./webmcp/confirmation/utils";

export const WebMcpRegistration: React.FunctionComponent = () => {
    const [modal, contextHolder] = Modal.useModal();
    useEffect(() => {
        if (!document.modelContext) {
            return;
        }
        const controller = new AbortController();
        const context = document.modelContext;
        const register = async () => {
            try {
                await registerMarketplaceTools(context, controller.signal, (tool, input, signal) => confirmWebMcpTool(modal, tool, input, signal));
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("WebMCP tool registration failed", error);
                    controller.abort(error);
                }
            }
        };
        register();
        return () => controller.abort();
    }, [modal]);
    return <>{contextHolder}</>;
};
