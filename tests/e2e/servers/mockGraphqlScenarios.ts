import type {
    MockCompany,
    MockIdentity,
    MockJob,
    MockProduct,
    MockScenarioState,
    MockStartup,
} from "./types";
import { toArray } from "./mockGraphqlHandlers/shared";

const buildDenseIdentity = (index: number, serverURL: string): MockIdentity => {
    const serverSuffix = new URL(serverURL).port || "server";
    return {
        id: `dense-${serverSuffix}-identity-${index}`,
        serverURL,
        name: `Dense Tribe ${index}`,
        description: `Synthetic tribe ${index} used for pagination coverage.`,
        priority: 10 + index,
        website: `https://dense-${index}.mock`,
        image: null,
    };
};

const buildDenseCompany = (index: number, serverURL: string, identityId: string, createdBy?: string | null): MockCompany => {
    const serverSuffix = new URL(serverURL).port || "server";
    return {
        id: `dense-${serverSuffix}-company-${index}`,
        serverURL,
        name: `Dense Company ${index}`,
        _status: "published",
        description: `Synthetic company ${index} used for pagination coverage.`,
        cryptoAddresses: null,
        website: `https://dense-company-${serverSuffix}-${index}.mock`,
        phone: null,
        email: `hello+dense-company-${serverSuffix}-${index}@mock`,
        allowedIdentities: [],
        disallowedIdentities: [],
        createdBy: createdBy ?? null,
        identity: identityId,
        priority: 10 + index,
        image: null,
    };
};

const buildDenseJob = (
    index: number,
    serverURL: string,
    companyId: string,
    createdBy?: string | null,
): MockJob => {
    const serverSuffix = new URL(serverURL).port || "server";
    return {
        id: `dense-${serverSuffix}-job-${index}`,
        serverURL,
        title: `Dense Job ${index}`,
        _status: "published",
        description: `Synthetic job ${index} used for pagination coverage.`,
        location: "Remote",
        employmentType: index % 2 === 0 ? "full-time" : "contract",
        positions: 1,
        postedAt: `2026-03-${String((index % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
        isActive: true,
        applyUrl: `https://dense-company-${serverSuffix}-${index}.mock/jobs/${index}`,
        bounty: null,
        salaryRange: null,
        allowedIdentities: [],
        disallowedIdentities: [],
        company: companyId,
        createdBy: createdBy ?? null,
        priority: 10 + index,
        image: null,
    };
};

const buildDenseStartup = (
    index: number,
    serverURL: string,
    companyId: string,
    identityId: string,
    createdBy?: string | null,
): MockStartup => {
    const serverSuffix = new URL(serverURL).port || "server";
    return {
        id: `dense-${serverSuffix}-startup-${index}`,
        serverURL,
        title: `Dense Venture ${index}`,
        _status: "published",
        description: `Synthetic venture ${index} used for pagination coverage.`,
        stage: index % 3 === 0 ? "idea" : index % 3 === 1 ? "seed" : "pre-seed",
        lookingFor: "generalist",
        alreadyHave: "early users",
        fundsNeeded: {
            amount: String(25000 + index * 1000),
            currency: "USD",
        },
        company: companyId,
        createdBy: createdBy ?? null,
        identity: identityId,
        involvedUsers: [],
        priority: 10 + index,
        createdAt: `2026-03-${String((index % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
        updatedAt: `2026-03-${String((index % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
        image: null,
    };
};

const buildDenseProduct = (
    index: number,
    serverURL: string,
    companyId: string,
    createdBy?: string | null,
): MockProduct => {
    const serverSuffix = new URL(serverURL).port || "server";
    return {
        id: `dense-${serverSuffix}-product-${index}`,
        serverURL,
        name: `Dense Product ${index}`,
        _status: "published",
        inventory: 20 + index,
        enableVariants: false,
        variantTypes: [],
        variants: [],
        priceInUSDEnabled: true,
        priceInUSD: 25 + index,
        priceInETH: `0.${String(1 + (index % 8)).padStart(2, "0")}`,
        priceInSOL: `0.${String(2 + (index % 8)).padStart(2, "0")}`,
        priceInTRX: String(75 + index * 3),
        description: `Synthetic product ${index} used for pagination coverage.`,
        cryptoAddresses: null,
        url: `https://dense-company-${serverSuffix}-${index}.mock/products/${index}`,
        orderable: true,
        properties: [],
        company: companyId,
        createdBy: createdBy ?? null,
        priority: 10 + index,
        createdAt: `2026-03-${String((index % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
        updatedAt: `2026-03-${String((index % 27) + 1).padStart(2, "0")}T09:00:00.000Z`,
        deletedAt: null,
        image: null,
    };
};

const buildSpecialProduct = (
    id: string,
    serverURL: string,
    companyId: string,
    createdBy: string | null,
    options: Partial<MockProduct>,
): MockProduct => {
    return {
        id,
        serverURL,
        name: options.name ?? id,
        _status: "published",
        inventory: options.inventory ?? 1,
        enableVariants: false,
        variantTypes: [],
        variants: [],
        priceInUSDEnabled: options.priceInUSDEnabled ?? true,
        priceInUSD: options.priceInUSD ?? 10,
        priceInETH: options.priceInETH ?? "0.01",
        priceInSOL: options.priceInSOL ?? "0.01",
        priceInTRX: options.priceInTRX ?? "1",
        description: options.description ?? `${id} synthetic commerce fixture.`,
        cryptoAddresses: options.cryptoAddresses ?? null,
        url: options.url ?? null,
        orderable: options.orderable ?? true,
        properties: [],
        company: companyId,
        createdBy,
        priority: options.priority ?? 100,
        createdAt: options.createdAt ?? "2026-03-01T09:00:00.000Z",
        updatedAt: options.updatedAt ?? "2026-03-01T09:00:00.000Z",
        deletedAt: null,
        image: null,
    };
};

type DenseScenarioState = MockScenarioState & {
    denseCollections?: boolean;
};

const getServerSuffix = (serverURL: string): string => {
    return new URL(serverURL).port || "server";
};

export const expandDenseScenario = (state: DenseScenarioState): MockScenarioState => {
    if (!state.denseCollections) {
        return state;
    }

    const serverURL = state.serverURL;
    const serverSuffix = getServerSuffix(serverURL);
    const createdBy = state.users[0]?.id ?? state.activeUserId ?? null;
    const primaryIdentityId = state.identities[0]?.id ?? `dense-${serverSuffix}-identity-primary`;
    const paymentIdentityId = state.identities.find((identity) => identity.name?.includes("Network"))?.id ?? primaryIdentityId;
    const paymentCompanyId = `dense-${serverSuffix}-company-payments`;
    const paymentCompany: MockCompany = {
        id: paymentCompanyId,
        serverURL,
        name: "Dense Payment Hub",
        _status: "published",
        description: "Synthetic company with a large mixed catalog for checkout coverage.",
        cryptoAddresses: {
            chain: "ethereum",
            address: "0x2222222222222222222222222222222222222222",
        },
        website: "https://dense-payments.mock",
        phone: "+1 555 0999",
        email: "hello@dense-payments.mock",
        allowedIdentities: [],
        disallowedIdentities: [],
        createdBy,
        identity: paymentIdentityId,
        priority: 999,
        image: null,
    };

    const specialProducts = [
        buildSpecialProduct(`dense-${serverSuffix}-product-eth-1`, serverURL, paymentCompanyId, createdBy, {
            name: "Dense Ethereum Bundle A",
            priceInETH: "0.02",
            priceInUSD: 18,
            priceInUSDEnabled: true,
            inventory: 6,
            url: "https://dense-payments.mock/products/eth-a",
            priority: 998,
        }),
        buildSpecialProduct(`dense-${serverSuffix}-product-eth-2`, serverURL, paymentCompanyId, createdBy, {
            name: "Dense Ethereum Bundle B",
            priceInETH: "0.03",
            priceInUSD: 24,
            priceInUSDEnabled: true,
            inventory: 4,
            url: "https://dense-payments.mock/products/eth-b",
            priority: 997,
        }),
        buildSpecialProduct(`dense-${serverSuffix}-product-locked`, serverURL, paymentCompanyId, createdBy, {
            name: "Dense Advisory Locked",
            orderable: false,
            inventory: null,
            priceInUSD: 150,
            priceInETH: "0.06",
            priceInSOL: "0.9",
            priceInTRX: "720",
            url: null,
            priority: 996,
        }),
    ];

    const extraIdentities = Array.from({ length: 20 }, (_value, index) => buildDenseIdentity(index + 1, serverURL));
    const extraCompanies = Array.from({ length: 22 }, (_value, index) =>
        buildDenseCompany(index + 1, serverURL, paymentIdentityId, createdBy),
    );
    const extraJobs = Array.from({ length: 22 }, (_value, index) => buildDenseJob(index + 1, serverURL, paymentCompanyId, createdBy));
    const extraStartups = Array.from({ length: 22 }, (_value, index) =>
        buildDenseStartup(index + 1, serverURL, paymentCompanyId, paymentIdentityId, createdBy),
    );
    const extraProducts = Array.from({ length: 22 }, (_value, index) =>
        buildDenseProduct(index + 1, serverURL, paymentCompanyId, createdBy),
    );

    return {
        ...state,
        activeUserId: null,
        identities: [...toArray(state.identities), ...extraIdentities],
        companies: [...toArray(state.companies), paymentCompany, ...extraCompanies],
        jobs: [...toArray(state.jobs), ...extraJobs],
        startups: [...toArray(state.startups), ...extraStartups],
        products: [...toArray(state.products), ...specialProducts, ...extraProducts],
    };
};
