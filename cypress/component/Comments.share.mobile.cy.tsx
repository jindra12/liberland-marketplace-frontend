import { MOBILE_VIEWPORT, installCommentSpecExceptionGuard, openShareAndCommentDetail, runOnViewport } from "./comments/shared";

describe("comments share flow mobile", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("reads comments, opens a share link, and adds a detail reply on mobile", () => {
        runOnViewport(MOBILE_VIEWPORT, () => openShareAndCommentDetail(MOBILE_VIEWPORT));
    });
});
