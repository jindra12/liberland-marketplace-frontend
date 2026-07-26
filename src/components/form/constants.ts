export const TEXT_INPUT_MAX_LENGTH = 100;
export const LONG_TEXT_INPUT_MAX_LENGTH = 600;

export const buildMaxLengthRule = (maxLength: number) => ({
    max: maxLength,
    message: `Maximum ${maxLength} characters`,
});
