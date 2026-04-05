import { defineConfig } from "cypress";

export default defineConfig({
    viewportWidth: 1200,
    viewportHeight: 1200,
    component: {
        devServer: {
            framework: "next",
            bundler: "webpack",
        },
        specPattern: "cypress/component/**/*.cy.tsx",
        supportFile: "cypress/support/component.ts",
    },
});
