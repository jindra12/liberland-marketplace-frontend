import { DESKTOP_VIEWPORT, createAndEditComment, installCommentSpecExceptionGuard, runOnViewport } from "./comments/shared";

describe("comments manage flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("creates and edits a comment with company selection on desktop", () => {
        runOnViewport(DESKTOP_VIEWPORT, () => createAndEditComment(DESKTOP_VIEWPORT));
    });
});
