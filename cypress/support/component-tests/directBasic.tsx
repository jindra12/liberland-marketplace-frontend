import { buildGraphQLAlias } from "../graphqlMock";
import { MAIN_SERVER_URL } from "./constants";
import { buildTestAuthContext, mountWithProviders } from "./mountBasic";

const getFormItem = (label: string) => cy.contains(".ant-form-item", label);

export const screenshotStep = (step: string, capture: "fullPage" | "viewport" | "runner" = "fullPage") => {
    const nextName = `${Cypress.spec.name} ${step}`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    cy.screenshot(nextName.length > 0 ? nextName : "after-test-step", {
        capture,
    });
};

export const fillFormField = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().clear({ force: true }).type(value, { force: true });
};

export const assertFormFieldValue = (label: string, value: string) => {
    getFormItem(label).find("input, textarea").first().should("have.value", value);
};

export const selectFormOption = (label: string, optionLabel: string) => {
    getFormItem(label).find(".ant-select-selector").first().click({ force: true });
    cy.get(".ant-select-dropdown").should("be.visible");
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", optionLabel).click({
        force: true,
    });
};

export const assertSelectValue = (label: string, value: string) => {
    getFormItem(label).should("contain.text", value);
};

const uploadImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S6cAAAAASUVORK5CYII=";
export const uploadTestImage = () => {
    cy.get('input[type="file"]').selectFile(
        {
            contents: Cypress.Buffer.from(uploadImageBase64, "base64"),
            fileName: "publish-image.png",
            mimeType: "image/png",
            lastModified: Date.now(),
        },
        { force: true },
    );
};

export const mockOwnedCompaniesByCreatorQuery = (
    docs: Array<{
        id: string;
        name: string;
        isPrivate: boolean;
    }>,
) => {
    cy.intercept("POST", "**/api/graphql", (req) => {
        const body = req.body as { operationName?: string; query?: string };

        if (body.operationName === "ListCompaniesByCreator" || body.query?.includes("ListCompaniesByCreator")) {
            req.alias = "ownedCompanies";
            req.reply({
                data: {
                    __typename: "Query",
                    Companies: {
                        __typename: "Companies",
                        docs: docs.map((company) => ({
                            __typename: "Company",
                            id: company.id,
                            isSubscribed: false,
                            serverURL: MAIN_SERVER_URL,
                            name: company.name,
                            verification: "Trader",
                            isPrivate: company.isPrivate,
                            likeCount: 0,
                            cryptoAddresses: {
                                chain: "Ethereum",
                                address: "0xOwnedCompany",
                            },
                            image: null,
                            _status: "published",
                        })),
                        totalDocs: docs.length,
                        limit: 100,
                        totalPages: 1,
                        page: 1,
                        hasPrevPage: false,
                        hasNextPage: false,
                        prevPage: null,
                        nextPage: null,
                    },
                },
            });
        }
    });
};

export const gqlAlias = (serverUrl: string, operationName: string, variables: Record<string, string | number | boolean | null | undefined>): string =>
    buildGraphQLAlias(serverUrl, operationName, variables);

export { buildTestAuthContext, mountWithProviders };
