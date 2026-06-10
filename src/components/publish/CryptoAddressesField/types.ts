import type { CryptoChain } from "../../../types";

export interface CryptoAddressesFormValue {
    chain?: CryptoChain | null;
    address?: string | null;
}

