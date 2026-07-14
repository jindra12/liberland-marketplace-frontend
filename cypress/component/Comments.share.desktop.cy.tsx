import {
    installCommentSpecExceptionGuard,
    openShareAndCommentDetail,
    runOnViewport,
    DESKTOP_VIEWPORT,
} from "./comments/shared";

describe("comments share flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("reads comments, opens a share link, and adds a detail reply on desktop", () => {
        runOnViewport(DESKTOP_VIEWPORT, (viewport) => {
            cy.resetQL();
            cy.clearLocalStorage();
            openShareAndCommentDetail(viewport);
        });
    });
});
