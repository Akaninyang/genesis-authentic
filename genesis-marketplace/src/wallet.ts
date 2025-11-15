// src/utils/wallet.ts
import { web3Enable, web3Accounts, web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import type { Signer } from "@polkadot/api/types";

export async function connectWallet(): Promise<InjectedAccountWithMeta[]> {
  const extensions = await web3Enable("LuxChain");

  if (extensions.length === 0) {
    throw new Error("Extension_Missing");
  }
  const allAccounts = await web3Accounts();

  if (allAccounts.length === 0) {
    throw new Error("NO_ACCOUNTS");
  }
  console.log("✅ Wallet connected!");
  console.log("Accounts:", allAccounts.map((acc) => acc.address));

  return allAccounts;
}
/**
@param account
*/

export async function getWalletSigner(account: InjectedAccountWithMeta): Promise<Signer> {
  const injector = await web3FromSource(account.meta.source);
  return injector.signer;
}

// import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

// export async function connectWallet() {
//   // Request access to the Polkadot.js extension
//   const extensions = await web3Enable('LuxChain Marketplace');
//   if (extensions.length === 0) {
//     throw new Error('No extension found. Please install the Polkadot.js extension.');
//   }

//   // Get all available accounts
//   const allAccounts = await web3Accounts();

//   if (allAccounts.length === 0) {
//     throw new Error('No accounts found. Please create one in the extension.');
//   }

//   console.log('✅ Wallet connected successfully!');
//   console.log('Accounts:', allAccounts);

//   return allAccounts;
// }