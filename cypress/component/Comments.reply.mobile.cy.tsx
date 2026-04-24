import { MOBILE_VIEWPORT, installCommentSpecExceptionGuard, replyToReplyChain, runOnViewport } from "./comments/shared";

describe("comments reply flow mobile", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("adds a reply to a reply chain on mobile", () => {
        runOnViewport(MOBILE_VIEWPORT, () => replyToReplyChain(MOBILE_VIEWPORT));
    });
});
