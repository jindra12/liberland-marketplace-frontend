import { Connection } from "@solana/web3.js";
import { createThirdwebClient } from "thirdweb";

export const paymentEthereumClient = createThirdwebClient({ clientId: process.env.REACT_APP_THIRDWEB! });
export const paymentSolanaConnection = new Connection(process.env.REACT_APP_HELIUS!, "finalized");
