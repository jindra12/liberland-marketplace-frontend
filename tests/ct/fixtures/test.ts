import fs from "node:fs/promises";
import path from "node:path";

import { expect, test as base } from "@playwright/experimental-ct-react";

import { installWalletMocks } from "./walletMocks";
import { createRequestRecorder } from "../helpers/network";

const REVIEW_VIDEOS_DIR = ".playwright-videos";

type NetworkRecorder = ReturnType<typeof createRequestRecorder>;

export const test = base.extend<{ network: NetworkRecorder }>({
    network: async ({ context }, use) => {
        const recorder = createRequestRecorder();
        context.on("request", recorder.recordRequest);
        await use(recorder);
        context.off("request", recorder.recordRequest);
    },
    context: async ({ context }, use) => {
        await installWalletMocks(context);
        await use(context);
    },
});

test.afterEach(async ({}, testInfo) => {
    await fs.mkdir(REVIEW_VIDEOS_DIR, { recursive: true });

    const titleSlug = testInfo.titlePath
        .filter(Boolean)
        .join(" ")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    const attachments = testInfo.attachments.filter((attachment) => {
        return attachment.path && typeof attachment.contentType === "string" && attachment.contentType.startsWith("video/");
    });

    await Promise.all(
        attachments.map(async (attachment, index) => {
            const sourcePath = attachment.path!;
            const suffix = testInfo.project.name.replace(/[^a-zA-Z0-9]+/g, "-");
            const retrySuffix = testInfo.retry > 0 ? `.retry-${testInfo.retry}` : "";
            const targetPath = path.join(
                REVIEW_VIDEOS_DIR,
                `${titleSlug || "video"}-${suffix}${retrySuffix}-${index + 1}.webm`,
            );
            await fs.copyFile(sourcePath, targetPath);
        }),
    );
});

export { expect };
