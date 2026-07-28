import type { FormInstance } from "antd";
import type { RuleObject } from "antd/es/form";

import type { ProfileContactFormValues, ProfileWalletFormValue } from "../types";

const toWalletKey = (wallet?: ProfileWalletFormValue) => {
    if (!wallet?.chain || !wallet?.provider || !wallet?.address) {
        return undefined;
    }

    return `${wallet.chain}::${wallet.provider}::${wallet.address}`;
};

export const buildProfileWalletDuplicateValidator = (
    form: FormInstance<ProfileContactFormValues>,
    fieldName: number,
) => {
    return async (_rule: RuleObject, address?: string) => {
        if (!address) {
            return;
        }

        const wallets = form.getFieldValue("wallets") as ProfileWalletFormValue[] | undefined;
        const currentWallet = wallets?.[fieldName];
        const currentKey = toWalletKey(currentWallet);
        if (!currentKey) {
            return;
        }

        const duplicate = (wallets ?? []).some((wallet, walletIndex) => {
            if (walletIndex === fieldName) {
                return false;
            }

            return toWalletKey(wallet) === currentKey;
        });

        if (duplicate) {
            throw new Error("This wallet is already added");
        }
    };
};
