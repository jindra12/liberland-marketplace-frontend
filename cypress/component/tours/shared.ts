import { detailRoute, MAIN_SERVER_URL, syndicationDetailRoute } from "../../support/component-tests/constants";
import {
    mountAnonymousRoute,
    mountAuthenticatedCartRoute,
    mountMainRoute,
    mountProfileRoute,
    screenshotStep,
} from "../../support/component-tests/utils";

import { TOUR_AUTH_PROMPT_STEPS, TOUR_DEFINITIONS } from "../../../src/components/tour/constants";
import type { TourRenderMode, TourType } from "../../../src/components/tour/types";
import { TOUR_LOCAL_STORAGE_KEY, selectTourSteps } from "../../../src/components/tour/utils";

Cypress.on("uncaught:exception", (error) => {
    if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        return false;
    }

    return undefined;
});

const TOUR_VIEWPORTS: Record<TourRenderMode, { width: number; height: number }> = {
    desktop: { width: 1440, height: 1200 },
    mobile: { width: 390, height: 844 },
};

const TOUR_CART_SECRETS = {
    [MAIN_SERVER_URL]: "anon-shopping-main-secret",
};

export type TourSuiteMode = TourRenderMode;

export type TourSuiteAuth = "authorized" | "unauthorized";

export type TourScenario = {
    type: TourType;
    auth: TourSuiteAuth;
    modes: TourSuiteMode[];
    captureStepIndexes?: Partial<Record<TourSuiteAuth, number[]>>;
    mount: (setup?: (win: Window) => void) => void;
};

const waitForTourStep = (title: string) => {
    cy.get(".ant-tour").should("be.visible");
    cy.contains(".ant-tour .ant-tour-title", title).should("be.visible");
};

const clickNextTourStep = () => {
    cy.contains(".ant-tour .ant-tour-buttons button", /Next|Finish/)
        .should("be.visible")
        .click({ waitForAnimations: false });
};

const runTourScenario = (scenario: TourScenario, auth: TourSuiteAuth, mode: TourSuiteMode) => {
    const definition = TOUR_DEFINITIONS[scenario.type];
    const descriptors = mode === "mobile" ? definition.mobile : definition.desktop;
    const steps = selectTourSteps(definition, mode, "main");
    const firstDescriptor = descriptors[0];
    const captureStepIndexes = scenario.captureStepIndexes?.[auth] ?? steps.map((_, index) => index);

    if (!firstDescriptor) {
        throw new Error(`Tour ${scenario.type} has no ${mode} descriptors`);
    }

    cy.viewport(TOUR_VIEWPORTS[mode].width, TOUR_VIEWPORTS[mode].height);
    cy.clearLocalStorage();
    scenario.mount((win) => {
        win.localStorage.setItem(TOUR_LOCAL_STORAGE_KEY, JSON.stringify(scenario.type));
    });

    if (!scenario.type.startsWith("publish") && firstDescriptor.selector) {
        cy.get(firstDescriptor.selector).first().scrollIntoView();
    }

    waitForTourStep(firstDescriptor.title);

    steps.forEach((_, index) => {
        if (index > 0) {
            clickNextTourStep();
        }

        const descriptor = descriptors[index];
        if (!descriptor) {
            throw new Error(`Missing tour descriptor ${index + 1} for ${scenario.type} in ${mode} mode`);
        }

        const shouldCaptureStep = captureStepIndexes.includes(index);
        const skipSelectorWait = scenario.type === "publish" || scenario.type.startsWith("publish-");

        if (!skipSelectorWait && shouldCaptureStep && descriptor.selector) {
            cy.get(descriptor.selector).first().scrollIntoView();
        }

        waitForTourStep(descriptor.title);

        if (shouldCaptureStep) {
            screenshotStep(`${scenario.type}-${mode}-step-${index + 1}`, "viewport");
        }
    });
};

export const runTourSuite = (scenarios: TourScenario[], auth: TourSuiteAuth) => {
    scenarios
        .filter((scenario) => scenario.modes.includes("desktop") || scenario.modes.includes("mobile"))
        .forEach((scenario) => {
            it(`${scenario.type} shows every step`, () => {
                if (scenario.modes.includes("desktop")) {
                    runTourScenario(scenario, auth, "desktop");
                }

                if (scenario.modes.includes("mobile")) {
                    runTourScenario(scenario, auth, "mobile");
                }
            });
        });
};

export const runAuthPromptScreenshot = (mode: TourSuiteMode) => {
    cy.viewport(TOUR_VIEWPORTS[mode].width, TOUR_VIEWPORTS[mode].height);
    cy.clearLocalStorage();
    mountAnonymousRoute("/publish", [MAIN_SERVER_URL], undefined, (win) => {
        win.localStorage.setItem(TOUR_LOCAL_STORAGE_KEY, JSON.stringify("publish"));
    });

    const promptStep = TOUR_AUTH_PROMPT_STEPS[mode][0];
    waitForTourStep(promptStep.title);
    screenshotStep(`tour-auth-prompt-${mode}`, "viewport");
};

export const UNAUTHORIZED_TOUR_SCENARIOS: TourScenario[] = [
    {
        type: "home",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "jobs",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/jobs", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "job-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(detailRoute("/jobs", "job-dockmaster"), setup);
        },
    },
    {
        type: "companies",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/companies", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "company-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(detailRoute("/companies", "company-harbor-labs"), setup);
        },
    },
    {
        type: "tribes",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/tribes", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "tribe-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(detailRoute("/tribes", "identity-nova"), setup);
        },
    },
    {
        type: "products",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/products-services", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "product-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(detailRoute("/products-services", "product-moon-lamp"), setup);
        },
    },
    {
        type: "posts",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/posts", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "post-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(detailRoute("/posts", "post-harbor-operations-digest"), setup);
        },
    },
    {
        type: "ventures",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/ventures", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "venture-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        captureStepIndexes: {
            unauthorized: [0, 2],
        },
        mount: (setup) => {
            mountMainRoute(detailRoute("/ventures", "startup-sky-relay"), setup);
        },
    },
    {
        type: "syndication",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/syndication", [MAIN_SERVER_URL], undefined, setup);
        },
    },
    {
        type: "syndication-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: (setup) => {
            mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL), setup);
        },
    },
    {
        type: "syndicate",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL], undefined, setup);
        },
    },
];

export const AUTHORIZED_TOUR_SCENARIOS: TourScenario[] = [
    {
        type: "profile",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountProfileRoute([MAIN_SERVER_URL], true, setup);
        },
    },
    {
        type: "profile-wallets",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountProfileRoute([MAIN_SERVER_URL], true, setup);
        },
    },
    {
        type: "profile-address",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountProfileRoute([MAIN_SERVER_URL], true, setup);
        },
    },
    {
        type: "cart",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL], TOUR_CART_SECRETS, true, setup);
        },
    },
    {
        type: "order",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: (setup) => {
            mountAuthenticatedCartRoute("/order", [MAIN_SERVER_URL], TOUR_CART_SECRETS, true, setup);
        },
    },
];
