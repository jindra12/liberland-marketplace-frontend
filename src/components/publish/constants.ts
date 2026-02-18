export interface CurrencyMeta {
    code: string;
    name: string;
    symbol: string;
    isCrypto: boolean;
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
    USD: { code: "USD", name: "US Dollar", symbol: "$", isCrypto: false },
    EUR: { code: "EUR", name: "Euro", symbol: "€", isCrypto: false },
    GBP: { code: "GBP", name: "British Pound", symbol: "£", isCrypto: false },
    SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", isCrypto: false },
    HNL: { code: "HNL", name: "Honduran Lempira", symbol: "L", isCrypto: false },
    BTC: { code: "BTC", name: "Bitcoin", symbol: "₿", isCrypto: true },
    ETH: { code: "ETH", name: "Ethereum", symbol: "Ξ", isCrypto: true },
    USDC: { code: "USDC", name: "USD Coin", symbol: "USDC", isCrypto: true },
    XMR: { code: "XMR", name: "Monero", symbol: "M", isCrypto: true },
    LLD: { code: "LLD", name: "Liberland Dollar", symbol: "LLD", isCrypto: true },
    LLM: { code: "LLM", name: "Liberland Merit", symbol: "LLM", isCrypto: true },
};

export const isCryptoCurrency = (code: string): boolean =>
    CURRENCIES[code]?.isCrypto ?? false;

export const currencyOptions = Object.values(CURRENCIES).map((c) => ({
    value: c.code,
    label: `${c.code} (${c.symbol})`,
}));
