import {
    installCommentSpecExceptionGuard,
    openShareAndCommentDetail,
    runOnBothViewports,
} from "./comments/shared";

describe("comments share flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("reads comments, opens a share link, and adds a detail reply on desktop", () => {
        runOnBothViewports((viewport) => {
            cy.resetQL();
            cy.clearLocalStorage();
            openShareAndCommentDetail(viewport);
        });
    });
});
