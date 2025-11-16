// src/wallet.ts
import { web3Enable, web3Accounts, web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import type { Signer } from "@polkadot/api/types";

export async function connectWallet(): Promise<InjectedAccountWithMeta[]> {
  const extensions = await web3Enable("GenesisMarketplace");
  if (extensions.length === 0) {
    throw new Error("Extension_Missing");
  }
  const allAccounts = await web3Accounts();

  if (allAccounts.length === 0) {
    throw new Error("NO_ACCOUNTS");
  }
  //console.log("✅ Wallet connected!");
  //console.log("Accounts:", allAccounts.map((acc) => acc.address));
  return allAccounts;
}
/**
@param account
*/
export async function getWalletSigner(account: InjectedAccountWithMeta): Promise<Signer> {
  const injector = await web3FromSource(account.meta.source);
  return injector.signer;
}
