import * as React from "react";

import { ServerUrlGuardContent } from "../../src/components/ServerUrlGuardContent";
import { GUEST_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders } from "../support/component-tests/directBasic";

const GuardedHarness: React.FunctionComponent = () => {
    return (
        <ServerUrlGuardContent
            isTrusted={false}
            isLoading={false}
            decodedServerURL={GUEST_SERVER_URL}
            displayServerURL={GUEST_SERVER_URL}
            setUrls={() => undefined}
        >
            <div className="GuardedPage">Guarded content</div>
        </ServerUrlGuardContent>
    );
};

describe("syndication guard", () => {
    it("shows the trust modal and reveals content after confirmation", () => {
        mountWithProviders(<GuardedHarness />, {
            route: "/guarded",
        });

        cy.contains(".ant-modal-title", "Trust this server?").should("be.visible");
        cy.contains(".ant-modal-body", GUEST_SERVER_URL).should("be.visible");
        cy.contains("Enable content from this server").should("be.visible");
        cy.contains("button", "Yes").should("be.visible");
        cy.contains("button", "No").should("be.visible");

        cy.contains("button", "Yes").click();
        cy.contains(".GuardedPage", "Guarded content").should("be.visible");
    });
});
