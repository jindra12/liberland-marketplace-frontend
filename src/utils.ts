import { ResultStatusType } from "antd/es/result";
import { DocType } from "./types";

export const convertStatusCode = (status?: number): ResultStatusType => {
    if (status === 403 || status === 404 || status === 500) {
        return status;
    }
    return "error";
};

export const getErrorMessage = (status?: number) => {
    switch (status) {
        case 403: return "Forbidden";
        case 404: return "Not Found";
        default: return "Try later";
    }
};

export const getImage = (doc?: DocType) => {
    switch (doc?.__typename) {
        case "Company":
        case "Identity":
        case "Job":
        case "Product":
            return doc?.image?.url;
        default:
            return undefined;
    }
};
