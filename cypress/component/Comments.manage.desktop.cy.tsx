import { detailRoute } from "../support/component-tests/constants";
import { mountAuthenticatedMainRoute } from "../support/component-tests/utils";
import { DESKTOP_VIEWPORT, createAndEditComment, installCommentSpecExceptionGuard, runOnViewport } from "./comments/shared";

describe("comments manage flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("creates and edits a comment with company selection on desktop", () => {
        runOnViewport(DESKTOP_VIEWPORT, () => createAndEditComment(DESKTOP_VIEWPORT));
    });

    it("routes unverified users to the email verification warning before commenting", () => {
        mountAuthenticatedMainRoute(detailRoute("/posts", "post-harbor-operations-digest"), false);

        cy.contains(".EntityCommentsSection", "Harbor Operations Digest keeps the team aligned.").should("be.visible");
        cy.contains(".EntityCommentsSection__header .CommentComposer button", "Comment").click();

        cy.contains(".PublishServer", "Choose where to publish", { timeout: 20000 }).should("be.visible");
        cy.contains(".PublishServer__card", "Main").click();
        cy.contains(".PublishServer__summary button", "Continue to publish").click();
        cy.contains(".Publish", "Email not verified", { timeout: 20000 }).should("be.visible");
    });
});
