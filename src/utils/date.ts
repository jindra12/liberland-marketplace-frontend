import dayjs from "dayjs";

export const formatPrettyDate = (value?: string | Date | null): string | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }

    const formatted = dayjs(value);
    if (!formatted.isValid()) {
        return undefined;
    }

    return formatted.format("MMM D, YYYY");
};
