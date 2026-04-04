import type {
    JsonObject,
    JsonValue,
    MockGraphqlRuntime,
    MockScenarioCatalog,
    MockScenarioSeed,
    MockScenarioState,
    SequenceState,
} from "./types";
import { expandDenseScenario } from "./mockGraphqlScenarios";
import { loadJson } from "./utils";

const isObject = (value: JsonValue | undefined): value is JsonObject => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

const cloneJson = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
};

const applyPlaceholders = <T extends JsonValue | undefined>(
    value: T,
    replacements: Record<string, string>,
): T => {
    if (typeof value === "string") {
        return Object.entries(replacements).reduce<string>((result, [key, replacement]) => {
            return result.split(`{{${key}}}`).join(replacement);
        }, value) as T;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => applyPlaceholders(entry, replacements)) as T;
    }

    if (!isObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => {
            return [key, applyPlaceholders(entryValue, replacements)];
        }),
    ) as T;
};

const mergeScenarioValues = <T extends JsonValue | undefined>(left: T, right: T): T => {
    if (Array.isArray(right)) {
        return cloneJson(right) as T;
    }

    if (!isObject(left) || !isObject(right)) {
        return cloneJson(right) as T;
    }

    return Object.entries(right).reduce<JsonObject>((result, [key, value]) => {
        return {
            ...result,
            [key]: key in result ? mergeScenarioValues(result[key], value) : cloneJson(value),
        };
    }, cloneJson(left)) as T;
};

const resolveScenario = (
    catalog: MockScenarioCatalog,
    scenarioName: string,
    chain: string[] = [],
): MockScenarioSeed => {
    const scenario = catalog.scenarios?.[scenarioName];

    if (!scenario) {
        throw new Error(`Unknown mock GraphQL scenario: ${scenarioName}`);
    }

    if (chain.includes(scenarioName)) {
        throw new Error(`Circular mock GraphQL scenario inheritance: ${[...chain, scenarioName].join(" -> ")}`);
    }

    if (!scenario.extends) {
        return cloneJson(scenario);
    }

    const baseScenario = resolveScenario(catalog, scenario.extends, [...chain, scenarioName]);
    return mergeScenarioValues(baseScenario as JsonObject, scenario as JsonObject) as MockScenarioSeed;
};

const defaultSequences: SequenceState = {
    analytics: 1,
    cart: 1,
    comment: 1,
    company: 1,
    job: 1,
    notificationSubscription: 1,
    order: 1,
    product: 1,
    startup: 1,
    transactionHash: 1,
};

const normalizeScenarioState = (
    scenarioState: MockScenarioSeed,
    scenarioName: string,
    serverURL: string,
): MockScenarioState => {
    return expandDenseScenario({
        activeUserId: scenarioState.activeUserId ?? null,
        carts: scenarioState.carts ?? [],
        comments: scenarioState.comments ?? [],
        companies: scenarioState.companies ?? [],
        currentScenario: scenarioName,
        identities: scenarioState.identities ?? [],
        jobs: scenarioState.jobs ?? [],
        notificationSubscriptions: scenarioState.notificationSubscriptions ?? [],
        orders: scenarioState.orders ?? [],
        products: scenarioState.products ?? [],
        sequences: {
            ...defaultSequences,
            ...scenarioState.sequences,
        },
        serverURL,
        startups: scenarioState.startups ?? [],
        syndications: scenarioState.syndications ?? [],
        users: scenarioState.users ?? [],
        denseCollections: scenarioState.denseCollections,
    });
};

export const createMockGraphqlRuntime = (fixturePath: string, serverURL: string): MockGraphqlRuntime => {
    const rawCatalog = loadJson<MockScenarioCatalog>(fixturePath);
    const catalog = applyPlaceholders(rawCatalog as JsonObject, {
        SERVER_URL: serverURL,
    }) as MockScenarioCatalog;
    const availableScenarios = Object.keys(catalog.scenarios ?? {});
    const defaultScenario =
        catalog.defaultScenario && availableScenarios.includes(catalog.defaultScenario)
            ? catalog.defaultScenario
            : availableScenarios[0];

    if (!defaultScenario) {
        throw new Error(`No scenarios defined in ${fixturePath}`);
    }

    let currentScenario = defaultScenario;
    let state = normalizeScenarioState(resolveScenario(catalog, currentScenario), currentScenario, serverURL);

    return {
        getAvailableScenarios: () => availableScenarios,
        getCurrentScenario: () => currentScenario,
        getState: () => state,
        reset: (scenarioName = currentScenario) => {
            state = normalizeScenarioState(resolveScenario(catalog, scenarioName), scenarioName, serverURL);
            currentScenario = scenarioName;
            return state;
        },
        setScenario: (scenarioName: string) => {
            if (!availableScenarios.includes(scenarioName)) {
                throw new Error(`Unknown mock GraphQL scenario: ${scenarioName}`);
            }

            currentScenario = scenarioName;
            state = normalizeScenarioState(resolveScenario(catalog, scenarioName), scenarioName, serverURL);
            return state;
        },
    };
};
