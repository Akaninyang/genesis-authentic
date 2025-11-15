// polkadotApi.ts
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import type { Product } from "./types.ts";
//import type { Option } from "@polkadot/types-codec";
//import type { ISubmittableResult } from "@polkadot/types/types";

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

export async function buyProduct(account: InjectedAccountWithMeta, productId: number): Promise<void> {
  const api = await connectApi();
  const injector = await web3FromAddress(account.address);
  const tx = api.tx.marketplace.buyProduct(productId);

  return new Promise<void>(async (resolve, reject) => {
    try {
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
        // Dispatch error handling
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
          events.forEach(({ event: { section, method, data } }) => {
            if (section === "marketplace" && method === "ProductPurchased") {
              console.log("🎉 Product purchased!", data.toHuman());
            }
          });
          unsub();
          resolve();
        }
      });
    } catch (err) {
      // Immediate errors like insufficient balance are caught here
      reject(err);
    }
  });
}

export async function redeemProduct(account: InjectedAccountWithMeta, productId: number): Promise<void> {
  const api = await connectApi();
  const injector = await web3FromAddress(account.address);
  const tx = api.tx.marketplace.redeemProduct(productId);

  return new Promise<void>(async (resolve, reject) => {
    try {
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
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

        if (status.isFinalized) {
          console.log("✅ Product redeemed!");
          events.forEach(({ event: { section, method, data } }) => {
            if (section === "marketplace" && method === "ProductRedeemed") {
              console.log("🎊 Event:", data.toHuman());
            }
          });
          unsub();
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function toggleSale(account: InjectedAccountWithMeta, productId: number, forSale: boolean): Promise<void> {
  const api = await connectApi();
  const injector = await web3FromAddress(account.address);
  const tx = api.tx.marketplace.toggleSale(productId, forSale);

  return new Promise<void>(async (resolve, reject) => {
    try {
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
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

        if (status.isFinalized) {
          console.log("✅ Sale toggled!");
          events.forEach(({ event: { section, method, data } }) => {
            if (section === "marketplace" && method === "SaleToggled") {
              console.log("⚙ Event:", data.toHuman());
            }
          });
          unsub();
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

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
// export async function fetchAllProducts(existingProducts: Product[]): Promise<Product[]> {
//   const api = await connectApi();
//   const keys = await api.query.marketplace.products.keys();
//   const updatedProducts: Product[] = [];

//   for (const key of keys) {
//     const id = key.args[0].toPrimitive() as number;
//     const value = await api.query.marketplace.products(id);
//     if (!value.isEmpty) {
//       const raw = value.toHuman() as any;
//       // Try to find a matching local product by ID
//       const existing = existingProducts.find(p => p.id === id);
//       // Merge chain data into the local frontend structure ?? existing?.onSale ?? false
//       const updated: Product = {
//         id,
//         name: raw.name || existing?.name || "Unnamed",
//         manufacturer: raw.genesis_owner || existing?.manufacturer || "Unknown",
//         image: existing?.image || "/placeholder.png", // ✅ Keep existing image
//         price: raw.price ? String(raw.price) : existing?.price || "0",
//         pastOwners: Number(raw.holders_count ?? existing?.pastOwners ?? 0),
//         description: existing?.description || "",
//         purchased: existing?.purchased ?? false,
//         onSale: Boolean(raw.on_sale ?? existing?.onSale ?? false),
//         isRedeemed: Boolean(raw.is_redeemed ?? existing?.isRedeemed ?? false),
//         owner: String(raw.owner),
//       };

//       updatedProducts.push(updated);
//     }
//   }

//   return updatedProducts;
// }
