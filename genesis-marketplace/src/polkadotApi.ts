// polkadotApi.ts
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress } from "@polkadot/extension-dapp";
//import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import type { Product } from "./types.ts";
import type { AppAccount } from "./App.tsx";
//import type { Option } from "@polkadot/types-codec";
import type { ISubmittableResult } from "@polkadot/types/types";

let api: ApiPromise | null = null;

export async function connectApi(): Promise<ApiPromise> {
  if (api) return api;
  
  const wssUrl = import.meta.env.VITE_WSS_URL || "ws://127.0.0.1:9944";
  const provider = new WsProvider(wssUrl);
  api = await ApiPromise.create({ provider });
  await api.isReady;
  console.log("✅ Connected to E-commerce blockchain node");
  return api;
}

// export async function buyProduct(account: AppAccount, productId: number): Promise<void> {
//   const api = await connectApi();

//   // Check if this is Bob / dev account
//   if ("type" in account && account.type === "dev") {
//     const tx = api.tx.marketplace.buyProduct(productId);
//     return new Promise<void>((resolve, reject) => {
//       tx.signAndSend(account.pair, ({ status, events, dispatchError }) => {
//         if (dispatchError) {
//           if (dispatchError.isModule) {
//             const decoded = api.registry.findMetaError(dispatchError.asModule);
//             const { docs, name, section } = decoded;
//             reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
//           } else {
//             reject(new Error(dispatchError.toString()));
//           }
//           return;
//         }

//         if (status.isInBlock) console.log("📦 Included in block (Bob)");
//         if (status.isFinalized) {
//           console.log("✅ Finalized (Bob)");
//           events.forEach(({ event: { section, method, data } }) => {
//             if (section === "marketplace" && method === "ProductPurchased") {
//               console.log("🎉 Product purchased by Bob!", data.toHuman());
//             }
//           });
//           resolve();
//         }
//       }).catch(reject);
//     });
//   }

//   // Otherwise, assume injected account
//   const injector = await web3FromAddress(account.address);
//   const tx = api.tx.marketplace.buyProduct(productId);

//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       const unsub = await tx.signAndSend(
//         account.address,
//         { signer: injector.signer },
//         ({ status, events, dispatchError }) => {
//           if (dispatchError) {
//             if (dispatchError.isModule) {
//               const decoded = api.registry.findMetaError(dispatchError.asModule);
//               const { docs, name, section } = decoded;
//               reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
//             } else {
//               reject(new Error(dispatchError.toString()));
//             }
//             unsub();
//             return;
//           }

//           if (status.isInBlock) console.log("📦 Included in block");
//           if (status.isFinalized) {
//             console.log("✅ Finalized");
//             events.forEach(({ event: { section, method, data } }) => {
//               if (section === "marketplace" && method === "ProductPurchased") {
//                 console.log("🎉 Product purchased!", data.toHuman());
//               }
//             });
//             unsub();
//             resolve();
//           }
//         }
//       );
//     } catch (err) {
//       reject(err);
//    }
//   });
// }

export async function buyProduct(account: AppAccount, productId: number): Promise<void> {
  const api = await connectApi();
  const tx = api.tx.marketplace.buyProduct(productId);

  return new Promise<void>((resolve, reject) => {
    const handler = (result: ISubmittableResult) => {
      const { status, events, dispatchError } = result;

      if (dispatchError) {
        let message = "";

        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { section, name, docs } = decoded;
          message = `${section}.${name}: ${docs.join(" ")}`;
        } else {
          message = dispatchError.toString();
        }

        reject(new Error(message));
        return;
      }

      if (status.isFinalized) {
        events.forEach(({ event }) => {
          const { section, method, data } = event;
          if (section === "marketplace" && method === "ProductPurchased") {
            console.log("🎉 Product purchased!", data.toHuman());
          }
        });
        resolve();
      }
    };

    try {
      if ('type' in account && account.type === 'dev') {
        // Bob / dev account
        tx.signAndSend(account.pair, handler).catch(reject);
      } else {
        // Injected account
        web3FromAddress(account.address)
          .then((injector) => {
            tx.signAndSend(account.address, { signer: injector.signer }, handler).catch(reject);
          })
          .catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}
// Toggle Sale
export async function toggleSale(account: AppAccount, productId: number, forSale: boolean): Promise<void> {
  const api = await connectApi();

  if ("type" in account && account.type === "dev") {
    const tx = api.tx.marketplace.toggleSale(productId, forSale);
    return new Promise<void>((resolve, reject) => {
      tx.signAndSend(account.pair, ({ status, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
          } else {
            reject(new Error(dispatchError.toString()));
          }
          return;
        }

        if (status.isInBlock) console.log("📦 Included in block (Bob)");
        if (status.isFinalized) {
          console.log("✅ Finalized (Bob)");
          resolve();
        }
      }).catch(reject);
    });
  }

  // Otherwise, injected account
  const injector = await web3FromAddress(account.address);
  const tx = api.tx.marketplace.toggleSale(productId, forSale);

  return new Promise<void>(async (resolve, reject) => {
    try {
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
          } else {
            reject(new Error(dispatchError.toString()));
          }
          unsub();
          return;
        }

        if (status.isInBlock) console.log("📦 Included in block");
        if (status.isFinalized) {
          console.log("✅ Finalized");
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Redeem Product
export async function redeemProduct(account: AppAccount, productId: number): Promise<void> {
  const api = await connectApi();

  if ("type" in account && account.type === "dev") {
    const tx = api.tx.marketplace.redeemProduct(productId);
    return new Promise<void>((resolve, reject) => {
      tx.signAndSend(account.pair, ({ status, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
          } else {
            reject(new Error(dispatchError.toString()));
          }
          return;
        }

        if (status.isInBlock) console.log("📦 Included in block (Bob)");
        if (status.isFinalized) {
          console.log("✅ Finalized (Bob)");
          resolve();
        }
      }).catch(reject);
    });
  }

  // Otherwise, injected account
  const injector = await web3FromAddress(account.address);
  const tx = api.tx.marketplace.redeemProduct(productId);

  return new Promise<void>(async (resolve, reject) => {
    try {
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
          } else {
            reject(new Error(dispatchError.toString()));
          }
          unsub();
          return;
        }

        if (status.isInBlock) console.log("📦 Included in block");
        if (status.isFinalized) {
          console.log("✅ Finalized");
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
// export async function redeemProduct(account: InjectedAccountWithMeta, productId: number): Promise<void> {
//   const api = await connectApi();
//   const injector = await web3FromAddress(account.address);
//   const tx = api.tx.marketplace.redeemProduct(productId);

//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
//         if (dispatchError) {
//           if (dispatchError.isModule) {
//             const decoded = api.registry.findMetaError(dispatchError.asModule);
//             const { docs, name, section } = decoded;
//             reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
//           } else {
//             reject(new Error(dispatchError.toString()));
//           }
//           unsub();
//           return;
//         }

//         if (status.isFinalized) {
//           console.log("✅ Product redeemed!");
//           events.forEach(({ event: { section, method, data } }) => {
//             if (section === "marketplace" && method === "ProductRedeemed") {
//               console.log("🎊 Event:", data.toHuman());
//             }
//           });
//           unsub();
//           resolve();
//         }
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// export async function toggleSale(account: InjectedAccountWithMeta, productId: number, forSale: boolean): Promise<void> {
//   const api = await connectApi();
//   const injector = await web3FromAddress(account.address);
//   const tx = api.tx.marketplace.toggleSale(productId, forSale);

//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
//         if (dispatchError) {
//           if (dispatchError.isModule) {
//             const decoded = api.registry.findMetaError(dispatchError.asModule);
//             const { docs, name, section } = decoded;
//             reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
//           } else {
//             reject(new Error(dispatchError.toString()));
//           }
//           unsub();
//           return;
//         }

//         if (status.isFinalized) {
//           console.log("✅ Sale toggled!");
//           events.forEach(({ event: { section, method, data } }) => {
//             if (section === "marketplace" && method === "SaleToggled") {
//               console.log("⚙ Event:", data.toHuman());
//             }
//           });
//           unsub();
//           resolve();
//         }
//       });
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

export async function getProduct(productId: number): Promise<any | null> {
  const api = await connectApi();
  const raw = await api.query.marketplace.products(productId);
  if (!raw) {
    console.log(`Product ${productId} not found on chain.`);
    return null;
  }
  // Use toHuman() to get JSON-friendly structure.
  const human = raw.toHuman();
  console.log("🔎 on-chain product:", human);
  return human;
}

export async function getAllProducts(): Promise<Product[]> {
  const api = await connectApi();
  const keys = await api.query.marketplace.products.keys();
  const results: Product[] = [];

  for (const key of keys) {
    const id = key.args[0].toPrimitive() as number;
    const raw = await api.query.marketplace.products(id);

    if (!raw.isEmpty) {
      const p = raw.toHuman() as any;
      results.push({
        id,
        name: p.name.toUtf8(), // convert BoundedVec<u8> to string
        manufacturer: p.genesis_owner.toString(),
        image: "", // keep frontend image static
        price: p.price.toString(),
        pastOwners: p.holders_count.toNumber(),
        purchased: false, // will derive later
        onSale: p.on_sale,
        isRedeemed: p.is_redeemed,
        description: p.metadata.toUtf8(),
        owner: p.owner.toString(),
      });
    }
  }

  return results;
}
