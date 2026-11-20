import { mountPostDetail } from "./comments/mount";
import {
    createAndEditComment,
    installCommentSpecExceptionGuard,
    runOnBothViewports,
} from "./comments/shared";

describe("comments manage flow desktop", () => {
    beforeEach(installCommentSpecExceptionGuard);

    it("creates and edits a comment with company selection on desktop", () => {
        runOnBothViewports((viewport) => {
            cy.resetQL();
            cy.clearLocalStorage();
            createAndEditComment(viewport);
        });
    });

    it("routes unverified users to the email verification warning before commenting", () => {
        mountPostDetail(false);

        cy.contains(".EntityCommentsSection", "Harbor Operations Digest keeps the team aligned.").should("be.visible");
        cy.contains(".EntityCommentsSection__header .CommentComposer button", "Comment").click();

        cy.contains("Please verify your email first").should("be.visible");
        cy.contains("Your email address still needs to be verified on Main before you can continue.").should(
            "be.visible",
        );
        cy.contains("Open Main").should("be.visible");
    });
});
