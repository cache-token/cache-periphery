import { Address } from "wagmi";

export interface IAppConfig {
  rpcUrl: string;
  alchemyKey: string;
  safeAddress: Address;
  tokenAddress: Address;
  recipientAddress: Address;
}
