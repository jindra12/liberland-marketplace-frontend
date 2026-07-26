import "cypress-react-router/add-commands";
import { drainGraphQLRequestLogs, installGraphQLMock, resetGraphQLMock } from "./graphqlMock";
import { installMediaUploadMock, resetMediaUploadMock } from "./graphqlMock/mediaMock";
import { resetWalletStubState } from "./walletStub/state";

import "../../src/index.scss";

const buildScreenshotName = (test?: Mocha.Test): string => {
    if (test === undefined) {
        return "after-test";
    }

    const nextName = `${Cypress.spec.name} ${test.fullTitle()}`
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return nextName.length > 0 ? nextName : "after-test";
};

Cypress.on("window:before:load", (win) => {
    const subtle = win.crypto.subtle as SubtleCrypto & {
        digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => Promise<ArrayBuffer>;
    };

    subtle.digest = async (_algorithm, data) => {
        const nextBuffer = new ArrayBuffer(data.byteLength);
        const nextBytes = new Uint8Array(nextBuffer);

        if (data instanceof ArrayBuffer) {
            nextBytes.set(new Uint8Array(data));
            return nextBuffer;
        }

        if (ArrayBuffer.isView(data)) {
            nextBytes.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            return nextBuffer;
        }

        return new ArrayBuffer(32);
    };
});

Cypress.on("uncaught:exception", (error) => {
    if (error.name === "ChunkLoadError") {
        return false;
    }

    if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        return false;
    }

    if (error.message.includes("ResizeObserver loop limit exceeded")) {
        return false;
    }

    return undefined;
});

Cypress.Commands.add("resetQL", () => {
    resetGraphQLMock();
});

Cypress.Commands.add("openPublishServerIfNeeded", () => {
    cy.get("body").then(($body) => {
        const category = $body.find(".Publish__category");
        const postForm = $body.find(".Publish__postTitleField");

        if (category.length === 0 && postForm.length === 0) {
            return;
        }

        if (postForm.length > 0) {
            const backButton = $body[0].querySelector(".Publish__back") as HTMLButtonElement | null;
            backButton?.click();
            return;
        }
    });
});

beforeEach(() => {
    cy.clearLocalStorage();
    cy.document().then((doc) => {
        doc.documentElement.setAttribute("data-cypress", "true");
    });
    installGraphQLMock();
    installMediaUploadMock();
    resetMediaUploadMock();
    resetWalletStubState();
});

afterEach(function (this: Mocha.Context) {
    cy.document().then((doc) => {
        doc.documentElement.removeAttribute("data-cypress");
    });
    resetGraphQLMock();

    const logs = drainGraphQLRequestLogs();
    if (logs.length > 0) {
        cy.task("saveGraphQLRequestLogs", {
            specRelative: Cypress.spec.relative,
            logs,
        });
    }
});
