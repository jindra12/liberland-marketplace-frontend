import { DESKTOP_VIEWPORT, installCommentSpecExceptionGuard, replyToReplyChain, runOnViewport } from "./comments/shared";

describe("comments reply flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("adds a reply to a reply chain on desktop", () => {
        runOnViewport(DESKTOP_VIEWPORT, () => replyToReplyChain(DESKTOP_VIEWPORT));
    });
});
