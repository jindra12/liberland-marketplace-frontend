import * as React from "react";

import { Form } from "antd";
import { useSessionStorage } from "usehooks-ts";

import { BuyNowButton } from "../../src/components/cart/BuyNowButton/BuyNowButton";
import { BUY_NOW_RETURN_TO_STORAGE_KEY } from "../../src/components/cart/BuyNowButton/constants";
import type { AddressWithEmail } from "../../src/components/order/types";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { buildTestAuthContext, mountWithProviders, screenshotStep } from "../support/component-tests/direct";

const guestProductRoute = "/products-services/guest-product-harbor-light";
const mainProductRoute = "/products-services/product-harbor-lantern";

const mainSavedShippingAddress: AddressWithEmail = {
    id: "saved-main-shipping-address",
    email: "nova@example.test",
    title: "Home",
    firstName: "Nova",
    lastName: "Rivers",
    company: "Harbor Labs",
    addressLine1: "1 Dockside Road",
    addressLine2: "Apt 12",
    city: "Port Sol",
    state: "Coast",
    postalCode: "11001",
    country: "Liberland",
    phone: "+1 555 0002",
};

const BuyNowHarness: React.FunctionComponent<{
    candidateProfileAddresses: AddressWithEmail[];
    quantity?: number;
}> = (props) => {
    const [form] = Form.useForm();
    const [pendingReturnTo] = useSessionStorage(BUY_NOW_RETURN_TO_STORAGE_KEY, "");

    return (
        <Form form={form} initialValues={{ quantity: props.quantity ?? 1, parameters: [] }}>
            <div className="BuyNowHarness__pendingReturnTo">{pendingReturnTo}</div>
            <BuyNowButton
                candidateProfileAddresses={props.candidateProfileAddresses}
                form={form}
                productId="product-harbor-lantern"
                quantity={props.quantity ?? 1}
                serverURL={MAIN_SERVER_URL}
                variantId={undefined}
            />
        </Form>
    );
};

const mountBuyNowHarness = (
    route: string,
    candidateProfileAddresses: AddressWithEmail[],
    auth = buildTestAuthContext(),
) => {
    mountWithProviders(<BuyNowHarness candidateProfileAddresses={candidateProfileAddresses} />, {
        auth,
        route,
    });
};

describe("buy now", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "MeUser" || body.query?.includes("MeUser")) {
                req.reply({
                    data: {
                        meUser: {
                            user: {
                                id: "user-nova",
                                name: "Nova Rivers",
                                email: "nova@example.test",
                                wallets: [],
                            },
                        },
                    },
                });
                return;
            }

            if (body.operationName === "CreateOrder" || body.query?.includes("CreateOrder")) {
                req.alias = "createOrder";
            }
        });
    });

    it("shows Buy now to anonymous users and redirects them to login", () => {
        const auth = buildTestAuthContext();
        const signinRedirect = cy.stub(auth, "signinRedirect").resolves();

        mountBuyNowHarness(guestProductRoute, [], auth);
        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible");

        cy.contains(".AddToCartButton__buyNow", "Buy now").click();
        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.wrap(null).should(() => {
            expect(signinRedirect.getCall(0)?.args[0]?.state).to.equal(guestProductRoute);
        });
        cy.contains(".BuyNowHarness__pendingReturnTo", guestProductRoute).should("be.visible");
    });

    it("returns to the current page and reopens buy now after login refresh", () => {
        const auth = buildTestAuthContext();
        const signinRedirect = cy.stub(auth, "signinRedirect").resolves();
        mountBuyNowHarness(mainProductRoute, [], auth);

        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.wrap(null).should(() => {
            expect(signinRedirect.getCall(0)?.args[0]?.state).to.equal(mainProductRoute);
        });
        cy.contains(".BuyNowHarness__pendingReturnTo", mainProductRoute).should("be.visible");

        mountBuyNowHarness(
            mainProductRoute,
            [mainSavedShippingAddress],
            buildTestAuthContext({
                isAuthenticated: true,
                user: {
                    profile: {
                        email_verified: true,
                    },
                } as never,
            }),
        );

        cy.wait("@createOrder");
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        cy.contains(".BuyNowPaymentModal", "Payment submitted").should("not.exist");
        screenshotStep("buy-now-returned-payment-modal");
    });

    it("tells users without a saved shipping address to go to profile", () => {
        mountBuyNowHarness(
            guestProductRoute,
            [],
            buildTestAuthContext({
                isAuthenticated: true,
                user: {
                    profile: {
                        email_verified: true,
                    },
                } as never,
            }),
        );

        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.contains(".BuyNowCreateOrderStep", "No default shipping addresses found").should("be.visible");
        screenshotStep("buy-now-no-default-shipping-addresses");
        cy.contains(".BuyNowCreateOrderStep .ant-modal-footer .ant-btn", "Go to profile")
            .should("be.visible")
            .click({ force: true });
        cy.location("pathname").should("eq", "/profile");
    });

    it("lets users pick an address and remembers it", () => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as { operationName?: string; query?: string };

            if (body.operationName === "CreateOrder" || body.query?.includes("CreateOrder")) {
                req.alias = "createOrder";
            }
        });

        mountBuyNowHarness(
            mainProductRoute,
            [
                mainSavedShippingAddress,
                {
                    ...mainSavedShippingAddress,
                    id: "other-shipping-address",
                    firstName: "Iris",
                    lastName: "Shore",
                    email: "iris@example.test",
                },
            ],
            buildTestAuthContext({
                isAuthenticated: true,
                user: {
                    profile: {
                        email_verified: true,
                    },
                } as never,
            }),
        );

        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.contains(".ShippingAddressSelectModal", "Choose a default shipping address").should("be.visible");
        screenshotStep("buy-now-shipping-address-picker");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore")
            .should("be.visible")
            .find(".ant-radio-input")
            .check({ force: true });

        cy.wait("@createOrder");
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        screenshotStep("buy-now-payment-modal-after-address-choice");
        cy.get(".BuyNowPaymentModal .ant-modal-close").click();
        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        cy.get(".ShippingAddressSelectModal").should("not.exist");
    });

    it("uses a saved shipping address to reach the payment modal immediately", () => {
        mountBuyNowHarness(
            mainProductRoute,
            [mainSavedShippingAddress],
            buildTestAuthContext({
                isAuthenticated: true,
                user: {
                    profile: {
                        email_verified: true,
                    },
                } as never,
            }),
        );

        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.wait("@createOrder");
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        screenshotStep("buy-now-saved-shipping-address-payment-modal");
        cy.get(".ShippingAddressSelectModal").should("not.exist");
    });
});
