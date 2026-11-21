import React from "react";
import { Flex } from "antd";
import { ProfileSummaryCard } from "../../src/components/ProfileContent/ProfileSummaryCard";
import { mountWithProviders } from "../support/component-tests/directBasic";

describe("profile summary layout", () => {
    [390, 1440].forEach((width) => {
        it(`keeps the email readable and verification visible at ${width}px`, () => {
            cy.viewport(width, 900);
            mountWithProviders(
                <Flex vertical className="Profile">
                    <ProfileSummaryCard
                        name="Marketplace Review Account"
                        email="marketplace.reviewer@example.test"
                        emailVerified
                    />
                </Flex>,
                { route: "/profile" },
            );
            cy.contains(".Profile__email", "marketplace.reviewer@example.test").should("be.visible").then(($email) => {
                const email = $email[0];
                expect(email.getBoundingClientRect().height).to.be.at.most(parseFloat(getComputedStyle(email).lineHeight) * 3);
            });
            cy.contains(".Profile__info .ant-tag", "Verified").should("be.visible");
            cy.get(".Profile__info").then(($card) => {
                expect($card[0].scrollWidth).to.be.at.most($card[0].clientWidth);
            });
            cy.get(".Profile__info").screenshot(`profile-summary-${width}`);
        });
    });
});
