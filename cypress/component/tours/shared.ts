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
    seedBeforeMount?: boolean;
    mount: () => void;
};

const seedTourSession = (tourType: TourType, notify = false) => {
    cy.window().then((win) => {
        const serialized = JSON.stringify(tourType);
        win.localStorage.setItem(TOUR_LOCAL_STORAGE_KEY, serialized);
        if (notify) {
            win.dispatchEvent(new win.StorageEvent("storage", { key: TOUR_LOCAL_STORAGE_KEY, newValue: serialized }));
        }
    });
};

const waitForTourStep = (title: string) => {
    cy.get(".ant-tour", { timeout: 20000 }).should("be.visible");
    cy.contains(".ant-tour .ant-tour-title", title, { timeout: 20000 }).should("be.visible");
};

const clickNextTourStep = () => {
    cy.contains(".ant-tour .ant-tour-buttons button", /Next|Finish/, { timeout: 20000 })
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
    if (scenario.seedBeforeMount === false) {
        scenario.mount();
        seedTourSession(scenario.type, true);
    } else {
        seedTourSession(scenario.type);
        scenario.mount();
    }

    if (!scenario.type.startsWith("publish") && firstDescriptor.selector) {
        cy.get(firstDescriptor.selector, { timeout: 20000 }).first().scrollIntoView();
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
            cy.get(descriptor.selector, { timeout: 20000 }).first().scrollIntoView();
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
    seedTourSession("publish");
    mountAnonymousRoute("/publish", [MAIN_SERVER_URL]);

    const promptStep = TOUR_AUTH_PROMPT_STEPS[mode][0];
    waitForTourStep(promptStep.title);
    screenshotStep(`tour-auth-prompt-${mode}`, "viewport");
};

export const UNAUTHORIZED_TOUR_SCENARIOS: TourScenario[] = [
    {
        type: "home",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "jobs",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/jobs", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "job-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(detailRoute("/jobs", "job-dockmaster"));
        },
    },
    {
        type: "companies",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/companies", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "company-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(detailRoute("/companies", "company-harbor-labs"));
        },
    },
    {
        type: "tribes",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/tribes", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "tribe-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(detailRoute("/tribes", "identity-nova"));
        },
    },
    {
        type: "products",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/products-services", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "product-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(detailRoute("/products-services", "product-moon-lamp"));
        },
    },
    {
        type: "posts",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/posts", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "post-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(detailRoute("/posts", "post-harbor-operations-digest"));
        },
    },
    {
        type: "ventures",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/ventures", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "venture-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        captureStepIndexes: {
            unauthorized: [0, 2],
        },
        mount: () => {
            mountMainRoute(detailRoute("/ventures", "startup-sky-relay"));
        },
    },
    {
        type: "syndication",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/syndication", [MAIN_SERVER_URL]);
        },
    },
    {
        type: "syndication-detail",
        auth: "unauthorized",
        modes: ["desktop"],
        mount: () => {
            mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL));
        },
    },
    {
        type: "syndicate",
        auth: "unauthorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL]);
        },
    },
];

export const AUTHORIZED_TOUR_SCENARIOS: TourScenario[] = [
    {
        type: "profile",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountProfileRoute([MAIN_SERVER_URL]);
        },
    },
    {
        type: "profile-wallets",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountProfileRoute([MAIN_SERVER_URL]);
        },
    },
    {
        type: "profile-address",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountProfileRoute([MAIN_SERVER_URL]);
        },
    },
    {
        type: "cart",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL], TOUR_CART_SECRETS);
        },
    },
    {
        type: "order",
        auth: "authorized",
        modes: ["desktop", "mobile"],
        mount: () => {
            mountAuthenticatedCartRoute("/order", [MAIN_SERVER_URL], TOUR_CART_SECRETS);
        },
    },
];
