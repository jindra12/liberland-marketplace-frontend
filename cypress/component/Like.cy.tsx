import { mount } from "cypress/react";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { Like } from "../../src/components/shared/Like/Like";

type LikeMutationCall = {
    id: string;
    liked: boolean;
    url?: string | null;
};

type DislikeMutationCall = {
    id: string;
    url?: string | null;
};

const mountLike = (liked: boolean | null | undefined) => {
    const likeMutation = cy.stub();
    const dislikeMutation = cy.stub();

    mount(
        <Like
            id="post-harbor-lantern"
            liked={liked}
            likeCount={42}
            serverURL={MAIN_SERVER_URL}
            likeMutation={{ mutate: likeMutation }}
            dislikeMutation={{ mutate: dislikeMutation }}
        />,
    );

    return { likeMutation, dislikeMutation };
};

describe("like", () => {
    const outlinedCases: Array<{ liked: boolean | null | undefined; label: string }> = [
        { liked: false, label: "false" },
        { liked: null, label: "null" },
        { liked: undefined, label: "undefined" },
    ];

    outlinedCases.forEach((testCase) => {
        it(`renders the outlined heart for ${testCase.label} liked state and uses the like mutation`, () => {
            const stubs = mountLike(testCase.liked);
            const expectedLikeCall: LikeMutationCall = {
                id: "post-harbor-lantern",
                liked: true,
                url: MAIN_SERVER_URL,
            };

            cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--unliked");
            cy.get(".LikeButton").should("have.css", "border-radius", "999px");
            cy.get(".LikeButton").should("have.css", "transition-property").and("contain", "transform");
            cy.get(".LikeButton").should("have.css", "background-image", "none");
            cy.get(".LikeButton").should("have.css", "background-color", "rgba(0, 0, 0, 0)");
            cy.get(".LikeButton").should("have.css", "box-shadow", "none");
            cy.get(".LikeButton").should("have.css", "text-shadow").and("not.equal", "none");
            cy.get(".LikeButton__heart--outlined").should("be.visible");
            cy.get(".LikeButton__count").should("have.text", "42");

            cy.get(".LikeButton").click();

            cy.wrap(stubs.likeMutation).should("have.been.calledWith", expectedLikeCall);
            cy.wrap(stubs.dislikeMutation).should("not.have.been.called");
        });
    });

    it("renders the filled heart for liked state and uses the dislike mutation", () => {
        const stubs = mountLike(true);
        const expectedDislikeCall: DislikeMutationCall = {
            id: "post-harbor-lantern",
            url: MAIN_SERVER_URL,
        };

        cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--liked");
        cy.get(".LikeButton__heart--filled").should("be.visible");
        cy.get(".LikeButton").should("have.css", "color").and("not.equal", "rgb(0, 0, 0)");
        cy.get(".LikeButton").click();

        cy.wrap(stubs.dislikeMutation).should("have.been.calledWith", expectedDislikeCall);
        cy.wrap(stubs.likeMutation).should("not.have.been.called");
    });

    it("keeps the heart icon and count centered on the same horizontal line", () => {
        mountLike(false);

        cy.get(".LikeButton__heart").then(($heart) => {
            const heartRect = $heart[0].getBoundingClientRect();

            cy.get(".LikeButton__count").then(($count) => {
                const countRect = $count[0].getBoundingClientRect();
                const heartCenterY = heartRect.top + heartRect.height / 2;
                const countCenterY = countRect.top + countRect.height / 2;

                expect(Math.abs(heartCenterY - countCenterY)).to.be.lessThan(2);
            });
        });
    });
});
