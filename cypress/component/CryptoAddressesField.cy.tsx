import * as React from "react";

import { mount } from "cypress/react";

import { Button, Form } from "antd";

import { CryptoAddressesField } from "../../src/components/publish/CryptoAddressesField/CryptoAddressesField";
import type { CryptoAddressesFormValue } from "../../src/components/publish/CryptoAddressesField/types";
import { buildCryptoAddressesInput, validateCryptoAddress } from "../../src/components/publish/CryptoAddressesField/utils";
import { screenshotStep } from "../support/component-tests/utils";

interface CryptoAddressesSubmitPayload {
    cryptoAddresses?: CryptoAddressesFormValue;
}

interface CryptoAddressesHarnessProps {
    onSubmit: (payload: CryptoAddressesSubmitPayload) => void;
}

const CryptoAddressesHarness: React.FunctionComponent<CryptoAddressesHarnessProps> = (props) => {
    const [form] = Form.useForm<CryptoAddressesSubmitPayload>();

    return (
        <Form form={form} layout="vertical" onFinish={props.onSubmit}>
            <CryptoAddressesField description="Optional payout wallet for checkout." />
            <Form.Item>
                <Button htmlType="submit">Save wallet</Button>
            </Form.Item>
        </Form>
    );
};

const selectChain = (chainName: string) => {
    cy.contains(".Publish__cryptoChainField .ant-select", "Select a wallet chain").click();
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", chainName)
        .should("be.visible")
        .click({ force: true });
};

describe("crypto addresses field", () => {
    it("validates wallet addresses by chain", () => {
        expect(validateCryptoAddress(undefined, "0x1234567890abcdef1234567890abcdef12345678")).to.equal(
            "Select a wallet chain first.",
        );
        expect(validateCryptoAddress("ethereum", undefined)).to.equal("Address is required when chain is selected.");
        expect(validateCryptoAddress("ethereum", "0x1234567890abcdef1234567890abcdef1234567")).to.equal(
            "Please enter a valid Ethereum address.",
        );
        expect(validateCryptoAddress("solana", "11111111111111111111111111111111")).to.equal(true);
    });

    it("submits a valid wallet payload", () => {
        let submittedPayload: CryptoAddressesSubmitPayload | undefined;

        mount(<CryptoAddressesHarness onSubmit={(payload) => (submittedPayload = payload)} />);

        selectChain("Ethereum");
        cy.get('input[placeholder="Enter wallet address"]').type(
            "0x1234567890abcdef1234567890abcdef12345678",
            { force: true },
        );
        cy.contains("button", "Save wallet").click();

        cy.wrap(null).should(() => {
            expect(submittedPayload).to.deep.equal({
                cryptoAddresses: {
                    chain: "ethereum",
                    address: "0x1234567890abcdef1234567890abcdef12345678",
                },
            });
        });
        screenshotStep("crypto-addresses-valid-submit");
    });

    it("builds normalized crypto address payloads", () => {
        expect(buildCryptoAddressesInput()).to.equal(undefined);
        expect(buildCryptoAddressesInput({ chain: "solana", address: " 11111111111111111111111111111111 " })).to.deep.equal(
            {
                chain: "solana",
                address: "11111111111111111111111111111111",
            },
        );
    });
});
