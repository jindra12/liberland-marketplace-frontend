import type { Job_EmploymentType } from "../../../generated/graphql";
import { isCryptoCurrency } from "../../publish/constants";
import { EMPLOYMENT_TYPE_LABELS, JOB_TIME_INTERVALS } from "./constants";

const getCryptoFractionDigits = (currency: string, fallback: number): number => {
    return isCryptoCurrency(currency) ? 6 : fallback;
};

const formatCurrencyValue = (amount: number, currency: string, fallbackFractionDigits: number): string => {
    return amount.toLocaleString("en-US", {
        maximumFractionDigits: getCryptoFractionDigits(currency, fallbackFractionDigits),
    });
};

export const timeAgo = (date: string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const interval = JOB_TIME_INTERVALS.find(([secondsPerUnit]) => seconds / secondsPerUnit >= 1);

    if (!interval) {
        return "just now";
    }

    const [secondsPerUnit, label] = interval;
    const count = Math.floor(seconds / secondsPerUnit);
    const plural = count > 1 ? "s" : "";
    return `${count} ${label}${plural} ago`;
};

export const formatSalary = (min?: number | null, max?: number | null, currency?: string | null): string | null => {
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;

    if (!hasMin && !hasMax) {
        return null;
    }

    const resolvedCurrency = currency ?? "USD";

    if (hasMin && hasMax) {
        return `${resolvedCurrency} ${formatCurrencyValue(min, resolvedCurrency, 0)} – ${formatCurrencyValue(max, resolvedCurrency, 0)}`;
    }

    if (hasMin) {
        return `From ${resolvedCurrency} ${formatCurrencyValue(min, resolvedCurrency, 0)}`;
    }

    return `Up to ${resolvedCurrency} ${formatCurrencyValue(max!, resolvedCurrency, 0)}`;
};

export const formatBounty = (amount?: number | null, currency?: string | null): string | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    const resolvedCurrency = currency ?? "USD";
    const fallbackFractionDigits = Number.isInteger(amount) ? 0 : 2;
    return `${resolvedCurrency} ${formatCurrencyValue(amount, resolvedCurrency, fallbackFractionDigits)}`;
};

export const formatPositions = (positions?: number | null): string | null => {
    if (positions === null || positions === undefined || positions <= 1) {
        return null;
    }

    const maximumFractionDigits = Number.isInteger(positions) ? 0 : 2;
    const value = positions.toLocaleString("en-US", { maximumFractionDigits });
    return `${value} positions`;
};

export const formatEmploymentType = (type?: Job_EmploymentType | null): string | null => {
    if (!type) {
        return null;
    }

    return EMPLOYMENT_TYPE_LABELS[type] ?? null;
};
