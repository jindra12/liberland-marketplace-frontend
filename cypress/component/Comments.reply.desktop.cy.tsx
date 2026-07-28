import {
    installCommentSpecExceptionGuard,
    replyToReplyChain,
    runOnBothViewports,
} from "./comments/shared";

describe("comments reply flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("adds a reply to a reply chain on desktop", () => {
        runOnBothViewports((viewport) => {
            cy.resetQL();
            cy.clearLocalStorage();
            replyToReplyChain(viewport);
        });
    });
});
