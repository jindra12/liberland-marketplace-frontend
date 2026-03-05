import { useMutation } from "@tanstack/react-query";
import { createThirdwebClient, estimateGas, getContract, prepareContractCall, toUnits } from "thirdweb";
import { useWalletBalance } from "thirdweb/react";
import { mainnet } from "thirdweb/chains";
import settings from "../settings.json";
import { FormModel } from "./types";
import { decimals } from "./constants";

const client = createThirdwebClient({
    clientId: settings.thirdwebId,
});

export const useEthereumVerifier = () => {
    const ethBalance = useWalletBalance({
        address: settings.seller.eth,
        chain: mainnet,
        client
    }, {
        enabled: false,
    });
    return useMutation({
        mutationKey: ["verify"],
        mutationFn: async (formModel: FormModel) => {
            const eth = (await ethBalance.refetch()).data!.value;
            const tx = prepareContractCall({
                contract: getContract({
                    address: formModel.token === "LLD" ? settings.lld.eth : settings.usdt.eth,
                    chain: mainnet,
                    client,
                }),
                method: "function transfer(address to, uint256 amount)",
                params: [formModel.recipient, toUnits(formModel.toAmount, decimals.Ethereum[formModel.token])],
            });
            const estimate = await estimateGas({
                transaction: tx,
                from: settings.seller.eth,
            });
            return eth > (estimate * 2n);
        },
    });
};