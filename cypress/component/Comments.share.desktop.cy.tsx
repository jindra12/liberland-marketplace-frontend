import { DESKTOP_VIEWPORT, installCommentSpecExceptionGuard, openShareAndCommentDetail, runOnViewport } from "./comments/shared";

describe("comments share flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("reads comments, opens a share link, and adds a detail reply on desktop", () => {
        runOnViewport(DESKTOP_VIEWPORT, () => openShareAndCommentDetail(DESKTOP_VIEWPORT));
    });
});
