export type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
export type JsonObject = {
    [key: string]: JsonValue | undefined;
};

export type CliArgs = Record<string, string>;

export type GraphqlVariables = JsonObject;

export type GraphqlBody = JsonObject & {
    operationName?: string;
    query?: string;
    variables?: GraphqlVariables;
};

export type GraphqlError = {
    message: string;
};

export type GraphqlOperationResult = {
    data?: JsonObject | null;
    errors?: GraphqlError[];
};

export type WalletMocksEvmConfig = {
    chainId: string;
    initialRecipientBalanceWei: string;
    initialSenderBalanceWei: string;
    recipient: string;
    sender: string;
    transferValueWei: string;
};

export type WalletMocksSolanaConfig = {
    initialRecipientLamports: number;
    initialSenderLamports: number;
    recipient: string;
    sender: string;
    transferLamports: number;
    transferSol: string;
};

export type WalletMocksTronConfig = {
    initialRecipientSun: number;
    initialSenderSun: number;
    recipient: string;
    recipientHex: string;
    sender: string;
    senderHex: string;
    transferSun: number;
};

export type WalletMocksConfig = {
    frontendPort: number;
    routePath: string;
    solanaRpcPort: number;
    syndicationServers: Array<{
        name: string;
        port: number;
    }>;
    tronRpcPort: number;
    wallets: {
        evm: WalletMocksEvmConfig;
        solana: WalletMocksSolanaConfig;
        tron: WalletMocksTronConfig;
    };
};

export type MockImage = {
    alt?: string | null;
    filename?: string | null;
    height?: number | null;
    id: string;
    mimeType?: string | null;
    url: string;
    width?: number | null;
};

export type MockCryptoAddress = {
    address?: string | null;
    chain?: string | null;
};

export type MockShippingAddress = {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    company?: string | null;
    country?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    postalCode?: string | null;
    state?: string | null;
    title?: string | null;
};

export type MockWallet = {
    address?: string | null;
    chain?: string | null;
    provider?: string | null;
};

export type MockUser = {
    email?: string | null;
    id: string;
    name?: string | null;
    phone?: string | null;
    shippingAddress?: MockShippingAddress | null;
    wallets?: MockWallet[];
};

export type MockIdentity = {
    description?: string | null;
    id: string;
    image?: MockImage | null;
    name?: string | null;
    priority?: number;
    serverURL?: string;
    website?: string | null;
};

export type MockCompany = {
    _status?: string;
    allowedIdentities?: string[];
    createdBy?: string | null;
    cryptoAddresses?: MockCryptoAddress | null;
    description?: string | null;
    disallowedIdentities?: string[];
    email?: string | null;
    id: string;
    identity?: string | null;
    image?: MockImage | null;
    name?: string | null;
    phone?: string | null;
    priority?: number;
    serverURL?: string;
    website?: string | null;
};

export type MockBounty = {
    amount?: number | string | null;
    currency?: string | null;
};

export type MockSalaryRange = {
    currency?: string | null;
    max?: number | null;
    min?: number | null;
};

export type MockJob = {
    _status?: string;
    allowedIdentities?: string[];
    applyUrl?: string | null;
    bounty?: MockBounty | null;
    company?: string | null;
    createdBy?: string | null;
    description?: string | null;
    disallowedIdentities?: string[];
    employmentType?: string | null;
    id: string;
    image?: MockImage | null;
    isActive?: boolean;
    location?: string | null;
    positions?: number | null;
    postedAt?: string | null;
    priority?: number;
    salaryRange?: MockSalaryRange | null;
    serverURL?: string;
    title?: string | null;
};

export type MockFundsNeeded = {
    amount?: number | string | null;
    currency?: string | null;
};

export type MockStartup = {
    _status?: string;
    alreadyHave?: string | null;
    company?: string | null;
    createdAt?: string | null;
    createdBy?: string | null;
    description?: string | null;
    fundsNeeded?: MockFundsNeeded | null;
    id: string;
    identity?: string | null;
    image?: MockImage | null;
    involvedUsers?: string[];
    lookingFor?: string | null;
    priority?: number;
    serverURL?: string;
    stage?: string | null;
    title?: string | null;
    updatedAt?: string | null;
};

export type MockVariantType = {
    id: string;
    label?: string | null;
    name?: string | null;
};

export type MockVariantOption = {
    id: string;
    label?: string | null;
    value?: string | null;
    variantType?: string | null;
};

export type MockVariant = {
    id: string;
    inventory?: number | null;
    options?: MockVariantOption[];
    priceInUSD?: number | null;
    priceInUSDEnabled?: boolean | null;
    title?: string | null;
};

export type MockProperty = {
    id: string;
    key?: string | null;
    value?: string | null;
};

export type MockProduct = {
    _status?: string;
    company?: string | null;
    createdAt?: string | null;
    createdBy?: string | null;
    cryptoAddresses?: MockCryptoAddress | null;
    deletedAt?: string | null;
    description?: string | null;
    enableVariants?: boolean;
    id: string;
    image?: MockImage | null;
    inventory?: number | null;
    name?: string | null;
    orderable?: boolean | null;
    priceInETH?: string | null;
    priceInSOL?: string | null;
    priceInTRX?: string | null;
    priceInUSD?: number | null;
    priceInUSDEnabled?: boolean | null;
    priority?: number;
    properties?: MockProperty[];
    serverURL?: string;
    updatedAt?: string | null;
    url?: string | null;
    variantTypes?: MockVariantType[];
    variants?: MockVariant[];
};

export type MockComment = {
    anonymousHash?: string | null;
    content?: string | null;
    createdAt?: string | null;
    createdBy?: string | null;
    id: string;
    replyComment?: string | null;
    replyPostRelationTo?: string | null;
    replyPostValue?: string | null;
    updatedAt?: string | null;
};

export type MockNotificationSubscription = {
    email?: string | null;
    id: string;
    targetCollection?: string | null;
    targetID?: string | null;
};

export type MockCartItem = {
    id: string;
    product?: string | null;
    quantity?: number | null;
    variant?: string | null;
};

export type MockCart = {
    createdAt?: string | null;
    currency?: string | null;
    customer?: string | null;
    id: string;
    items?: MockCartItem[];
    purchasedAt?: string | null;
    secret?: string | null;
    status?: string | null;
    subtotal?: number | null;
    updatedAt?: string | null;
};

export type MockOrderCryptoPrice = {
    chain?: string | null;
    expectedNativeAmount?: string | null;
    fetchedAt?: string | null;
    id: string;
    nativePerStable?: string | null;
    stablePerNative?: string | null;
};

export type MockOrderTransactionHash = {
    chain?: string | null;
    id: string;
    product?: string | null;
    transactionHash?: string | null;
};

export type MockOrderItem = {
    id: string;
    product?: string | null;
    quantity?: number | null;
    variant?: string | null;
};

export type MockOrder = {
    amount?: number | null;
    createdAt?: string | null;
    cryptoPrices?: MockOrderCryptoPrice[];
    currency?: string | null;
    customer?: string | null;
    customerEmail?: string | null;
    id: string;
    items?: MockOrderItem[];
    payerAddress?: string | null;
    shippingAddress?: MockShippingAddress | null;
    status?: string | null;
    transactionHashes?: MockOrderTransactionHash[];
    transactions?: Array<string | { id: string }>;
    updatedAt?: string | null;
};

export type MockSyndication = {
    description?: string | null;
    id: string;
    name?: string | null;
    url?: string | null;
};

export type SequenceState = {
    analytics: number;
    cart: number;
    comment: number;
    company: number;
    job: number;
    notificationSubscription: number;
    order: number;
    product: number;
    startup: number;
    transactionHash: number;
};

export type MockScenarioState = {
    activeUserId: string | null;
    carts: MockCart[];
    comments: MockComment[];
    companies: MockCompany[];
    currentScenario: string;
    identities: MockIdentity[];
    jobs: MockJob[];
    notificationSubscriptions: MockNotificationSubscription[];
    orders: MockOrder[];
    products: MockProduct[];
    sequences: SequenceState;
    serverURL: string;
    startups: MockStartup[];
    syndications: MockSyndication[];
    users: MockUser[];
};

export type MockScenarioSeed = Partial<Omit<MockScenarioState, "currentScenario" | "serverURL">> & {
    extends?: string;
    denseCollections?: boolean;
};

export type MockScenarioCatalog = {
    defaultScenario?: string;
    scenarios: Record<string, MockScenarioSeed>;
};

export type MockGraphqlRuntime = {
    getAvailableScenarios: () => string[];
    getCurrentScenario: () => string;
    getState: () => MockScenarioState;
    reset: (scenarioName?: string) => MockScenarioState;
    setScenario: (scenarioName: string) => MockScenarioState;
};
