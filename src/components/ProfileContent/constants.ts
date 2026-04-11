import { UserUpdate_Wallets_Chain_MutationInput } from "../../generated/graphql";

export const PROFILE_WALLET_CHAIN_OPTIONS = [
    {
        label: "Ethereum",
        value: UserUpdate_Wallets_Chain_MutationInput.Ethereum,
    },
    {
        label: "Solana",
        value: UserUpdate_Wallets_Chain_MutationInput.Solana,
    },
    {
        label: "Tron",
        value: UserUpdate_Wallets_Chain_MutationInput.Tron,
    },
] as const;
