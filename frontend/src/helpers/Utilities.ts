import { IAppConfig } from '../models/Base';

export const getAppConfig = (): IAppConfig => {
    return {
      rpcUrl: process.env.REACT_APP_RPC_URL,
      alchemyKey: process.env.REACT_APP_ALCHEMY_API_KEY,
      safeAddress: process.env.REACT_APP_SAFE_ADDRESS,
      tokenAddress: process.env.REACT_APP_TOKEN_ADDRESS,
      recipientAddress: process.env.REACT_APP_RECIPIENT_ADDRESS,
    } as IAppConfig;
}
