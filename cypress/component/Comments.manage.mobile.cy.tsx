import { MOBILE_VIEWPORT, createAndEditComment, installCommentSpecExceptionGuard, runOnViewport } from "./comments/shared";

describe("comments manage flow mobile", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("creates and edits a comment with company selection on mobile", () => {
        runOnViewport(MOBILE_VIEWPORT, () => createAndEditComment(MOBILE_VIEWPORT));
    });
});
