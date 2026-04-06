import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../../src/Main";

import { MAIN_SERVER_URL, SYNDICATION_LIST_GOAL } from "./constants";
import { buildGraphQLAlias } from "../graphqlMock";
import type {
    DetailGoal,
    GraphQLCollectionResponse,
    GraphQLNodeResponse,
    GraphQLResponseBody,
    GraphQLVariables,
    ListGoal,
    SearchGoal,
} from "./types";

export const gqlAlias = (serverUrl: string, operationName: string, variables: GraphQLVariables): string =>
    buildGraphQLAlias(serverUrl, operationName, variables);

export const mountMainHome = () => {
    mount(<Main />);
    cy.routerNavigate("/");
    cy.get(".LoadingSkeleton--boot").should("not.exist");
    cy.get(".SplashPage").should("be.visible");
};

export const homepageQueries = () => {
    waitForCollectionQuery(MAIN_SERVER_URL, "ListIdentities", { limit: 100, page: 1 }, "Identities", "Nova Rivers");
    waitForCollectionQuery(MAIN_SERVER_URL, "ListPublishedSyndicationUrls", {}, "Syndications", "Main");
};

export const openDesktopMenu = () => {
    cy.get('button[aria-label="Open menu"]').click();
};

export const openSearchScope = (scopeLabel: string) => {
    openDesktopMenu();
    cy.contains(".AppHeader__desktopDrawer button", "Search").click();
    cy.get(".SearchButton__menuOverlay").should("be.visible").contains(scopeLabel).click();
};

export const waitForPageShell = () => {
    cy.get(".LoadingSkeleton--surface").should("not.exist");
};

export const waitForCollectionQuery = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedTitle: string,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, expectedVariables)}`).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const collection = response?.data?.[responseKey] as GraphQLCollectionResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.greaterThan(0);
        expect(collection?.docs?.[0]?.title ?? collection?.docs?.[0]?.name).to.equal(expectedTitle);
    });
};

export const waitForDetailQuery = (
    serverUrl: string,
    operationName: string,
    expectedVariables: GraphQLVariables,
    responseKey: string,
    expectedId: string,
    expectedTitle: string,
) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, expectedVariables)}`).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const node = response?.data?.[responseKey] as GraphQLNodeResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(node?.id).to.equal(expectedId);
        expect(node?.title ?? node?.name).to.equal(expectedTitle);
    });
};

export const waitForSearchQuery = (serverUrl: string, operationName: string, searchTerm: string, expectedTitle: string) => {
    cy.wait(`@${gqlAlias(serverUrl, operationName, { searchTerm, page: 1, limit: 5 })}`).then((interception) => {
        const response = interception.response?.body as GraphQLResponseBody | undefined;
        const collection = response?.data?.Searches as GraphQLCollectionResponse | undefined;

        expect(interception.request.url).to.equal(`${serverUrl}/api/graphql`);
        expect(interception.response?.statusCode).to.equal(200);
        expect(collection?.docs?.length ?? 0).to.be.greaterThan(0);
        expect(collection?.docs?.[0]?.title ?? collection?.docs?.[0]?.name).to.equal(expectedTitle);
    });
};

export const goToList = (goal: ListGoal) => {
    cy.contains(".AppHeader__menuLink", goal.trigger).click();
    cy.location("pathname").should("eq", goal.route);
    waitForPageShell();
    waitForCollectionQuery(MAIN_SERVER_URL, goal.operationName, goal.expectedVariables, goal.responseKey, goal.expectedResultTitle);
    cy.contains("h2", goal.title).should("be.visible");
};

export const goToDetailFromHome = (goal: DetailGoal) => {
    cy.contains(goal.selector, goal.label).click();
    cy.location("pathname").should("eq", goal.route);
    waitForPageShell();
    if (goal.query !== undefined) {
        waitForDetailQuery(
            MAIN_SERVER_URL,
            goal.query.operationName,
            goal.query.expectedVariables,
            goal.query.responseKey,
            goal.query.expectedId,
            goal.title,
        );
    }
    cy.contains("h1", goal.title).should("be.visible");
};

export const goToDetailFromSearch = (goal: SearchGoal) => {
    openSearchScope(goal.scopeLabel);
    cy.contains(".ant-drawer-title", goal.searchTitle).should("be.visible");
    cy.get('input[type="search"]').type(goal.term);
    waitForSearchQuery(MAIN_SERVER_URL, goal.searchOperationName, goal.term, goal.searchExpectedTitle);
    cy.get(".ant-select-item-option").contains(goal.resultLabel).click();
    cy.location("pathname").should("eq", goal.route);
    waitForPageShell();
    waitForDetailQuery(MAIN_SERVER_URL, goal.detailOperationName, goal.detailExpectedVariables, goal.responseKey, goal.expectedId, goal.title);
    cy.contains("h1", goal.title).should("be.visible");
};

export const goToSyndicationList = () => {
    cy.get(".SplashPage__syndicationManageBtn").contains(SYNDICATION_LIST_GOAL.clickLabel).click();
    cy.location("pathname").should("eq", SYNDICATION_LIST_GOAL.route);
    waitForPageShell();
    cy.contains("h2", SYNDICATION_LIST_GOAL.title).should("be.visible");
};
