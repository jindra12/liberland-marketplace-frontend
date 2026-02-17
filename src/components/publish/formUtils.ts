/** Converts empty strings to `undefined` in a flat object. */
export const stripEmpty = <T extends Record<string, unknown>>(obj: T): T => {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
        if (result[key] === "") {
            (result as Record<string, unknown>)[key] = undefined;
        }
    }
    return result;
};
