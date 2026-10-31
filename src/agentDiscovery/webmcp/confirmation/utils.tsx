import { Input, Modal } from "antd";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const confirmWebMcpTool = async (
    modal: ReturnType<typeof Modal.useModal>[0],
    tool: Tool,
    input: Record<string, unknown>,
    signal: AbortSignal,
): Promise<boolean> => {
    signal.throwIfAborted();
    const controller = new AbortController();
    try {
        return await new Promise<boolean>((resolve) => {
            const dialog = modal.confirm({
                title: `Allow AI action: ${tool.title || tool.name}?`,
                content: <Input.TextArea readOnly value={JSON.stringify(input, null, 2)} autoSize={{ minRows: 3, maxRows: 12 }} />,
                okText: "Approve action",
                cancelText: "Cancel",
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
                afterClose: () => resolve(false),
            });
            signal.addEventListener("abort", () => {
                dialog.destroy();
                resolve(false);
            }, { once: true, signal: controller.signal });
        });
    } finally {
        controller.abort();
    }
};
