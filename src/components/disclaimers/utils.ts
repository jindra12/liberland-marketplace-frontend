import { disclaimerDefinitions } from "./constants";
import type { DisclaimerDefinition, DisclaimerKey } from "./types";

export const getDisclaimerDefinition = (key: DisclaimerKey): DisclaimerDefinition => {
    const disclaimer = disclaimerDefinitions.find((definition) => definition.key === key);
    return disclaimer || disclaimerDefinitions[0];
};
