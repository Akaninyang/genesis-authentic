import { useState, useEffect } from 'react'
import { connectApi, buyProduct, toggleSale, redeemProduct } from './polkadotApi.ts'
import { connectWallet } from './wallet.ts'
import Home from './pages/Home.tsx'
import Locker from './pages/Locker.tsx'
import Header from './components/Header.tsx'
import WalletModal from './components/WalletModal.tsx'
import TransactionModal from './components/TransactionModal.tsx'
import { products as initialProducts } from './data/products.ts'
import type { Product } from './types.ts'
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"
import type { KeyringPair } from "@polkadot/keyring/types";

export type AppAccount = 
  | (InjectedAccountWithMeta & {address: string})
  | { type: "dev"; pair: KeyringPair; name: string; address: string };

export default function App() {
  const [route, setRoute] = useState<'home' | 'locker'>('home')
  const [locker, setLocker] = useState<Product[]>([])
  //const [toast, setToast] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connected, setConnected] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  //const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null); 
  
  const [account, setAccount] = useState<AppAccount | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<(InjectedAccountWithMeta)[]>([]);
  const [txModal, setTxModal] = useState({
    show: false,
    status: null as "pending" | "success" | "error" | null,
    message: "",
  });

useEffect(() => {
  (async () => {
    if (!account) return;

    try {
      const api = await connectApi();
      const keys = await api.query.marketplace.products.keys();
      const updatedProducts: Product[] = [];

      for (const key of keys) {
        const id = key.args[0].toPrimitive() as number;
        const value = await api.query.marketplace.products(id);

        if (!value.isEmpty) {
          const chainBool = (value: any) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value.toLowerCase() === 'true';
            if (typeof value === 'number') return value !== 0;
            return false;
            };

        const toNum = (val: any): number => {
          if (!val) return 0;
          try {
            if (val.toBigInt) return Number(val.toBigInt());
            if (val.toBn) return val.toBn().toNumber();
            if (typeof val === 'bigint') return Number(val);
            if (typeof val === 'string') return parseInt(val);
            if (typeof val === 'number') return val;
          } catch {
            return 0;
          }
          return 0;
        };
          const raw = value.toHuman() as any;
          const existing = initialProducts.find(p => p.id === id);
          const updated: Product = {
            id,
            name: raw.name || existing?.name || "Unnamed",
            manufacturer: raw.genesis_owner || existing?.manufacturer || "Unknown",
            image: existing?.image || raw.metadata,
            price: raw.price ? String(raw.price) : existing?.price || "0",
            pastOwners: (toNum(raw.holders_count)),
            description: existing?.description || "",
            purchased: false,
            onSale: chainBool(raw.onSale),
            isRedeemed: chainBool(raw.isRedeemed),
            owner: (raw.owner),
          };
          console.log(raw);
          console.log(updated);
          updatedProducts.push(updated);
        }
      }
      // Update frontend products
      setProducts(updatedProducts);
      // Update locker for the current account"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      setLocker(
        updatedProducts.filter(p => p.owner === account?.address)
      );

    } catch (err) {
      console.error("Failed to sync products with chain:", err);
    }
  })();
}, [account]);

useEffect(() => {
  (async () => {
    const allAccounts = await connectWallet();
    setAccounts(allAccounts);
  })();
}, []);

useEffect(() => {
  connectApi()
}, [])

  async function handleConnectWallet(selectedAccount: AppAccount) {
    setAccount(selectedAccount);
    setShowWalletModal(false);
    setConnected(true);
}
  async function handleBuy(product: Product) {
    if (!account) { 
      setShowWalletModal(true);
      return;
    }
    try {
      setTxModal({
        show: true,
        status: "pending",
        message: "Please wait while we process your action...",
      });
          if ("type" in account && account.type === "dev") {
      // Bob buys directly with keyring signer
      const api = await connectApi();
      const tx = api.tx.marketplace.buyProduct(product.id);

      await new Promise<void>(async (resolve, reject) => {
        try {
          const unsub = await tx.signAndSend(account.pair, ({ status, dispatchError }) => {
            if (dispatchError) {
              reject(new Error(dispatchError.toString()));
              unsub();
              return;
            }
            if (status.isFinalized) {
              console.log("✅ Bob purchase finalized");
              unsub();
              resolve();
            }
          });
        } catch (err) {
          reject(err);
        }
      });

    } else {
      // normal injected account
      await buyProduct(account, product.id);
    }


      setTxModal({
        show: true,
        status: "success",
        message: "Purchase successful!",
      });
      // Add to locker
      setLocker(prev => [product, ...prev]);
      setLocker(prev =>
        prev.map(p =>
          (p.id === product.id) ? { ...p, onSale: false } : p
        )
      );
      //Set purchased and onsale of product in frontend
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, onSale: false } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      setTxModal({
        show: true,
        status: "error",
        message: err?.toString() || "Transaction failed. Please try again.",
      });
    }
  }

  async function handleToggleSale(product: Product, forSale: boolean) {
    if (!account) { 
      setShowWalletModal(true);
      return;
    }
    try {
      setTxModal({
        show: true,
        status: "pending",
        message: forSale ? "Please wait while we list your product..." : "Please wait while we unlist your product...",
      });
      await toggleSale(account, product.id, forSale);

      setTxModal({
        show: true,
        status: "success",
        message: forSale ? "Congratulations! Product Listing Successful!" : "Product Unlisting Successful!",
      });
      setLocker(prev =>
        prev.map(p =>
          (p.id === product.id) ? { ...p, onSale: forSale } : p
        )
      );
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, onSale: forSale } : p
        )
      );
    } catch (err: any) {
      console.error("Failed to toggle sale:", err);
      setTxModal({
        show: true,
        status: "error",
        message: err?.toString() || "Transaction failed. Please try again.",
      });
    }
  }

  async function handleRedeem(product: Product) {
    if (!account) { 
      setShowWalletModal(true);
      return;
    }
    try {
      setTxModal({
        show: true,
        status: "pending",
        message: "Please wait while we process product redeem...",
      });
      await redeemProduct(account, product.id);
    
      setTxModal({
        show: true,
        status: "success",
        message: "Redeemed Successfully! Product will be delivered shortly.",
      });
      setLocker(prevLocker =>
        prevLocker.map(p =>
          p.id === product.id ? { ...p, isRedeemed: true } : p
        )
      );
      setProducts(prev =>
        prev.map(p =>
          p.id === product.id ? { ...p, isRedeemed: true } : p
        )
      );
    } catch (err: any) {
      console.error("Failed to redeem product:", err);
      setTxModal({
        show: true,
        status: "error",
        message: err?.toString() || "Product Redeem failed. Please try again.",
      });
    }
  }
  return (
    <div className="min-h-screen">
      <div className="container">
        <Header onNavigate={setRoute} lockerCount={locker.length} />
        <main>
          {route === 'home'
            ? <Home products={products} onBuy={handleBuy} connected={connected} onConnectWallet={() => setShowWalletModal(true)} />
            : <Locker locker={locker} onToggleSale={handleToggleSale} onRedeem={handleRedeem} />}
        </main>
      </div>

      {/* {toast && (
        <div className="fixed inset-0 flex items-center justify-center modal-backdrop">
          <div className="p-6 rounded-lg bg-[#0f0f11] card">
            <div className="text-lg font-medium gold">✓ Purchased</div>
            <div className="small-muted mt-1">{toast}</div>
          </div>
        </div>
      )} */}
      {/* <div>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200}/>}
      </div> */}

      {showWalletModal && (
        <WalletModal
          show={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleConnectWallet}
          accounts={accounts}
          error={null}
        />
      )}

       {/* 🆕 Error modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center modal-backdrop">
          <div className="p-6 rounded-lg bg-[#2a2a2c] card text-center">
            <div className="text-lg font-medium text-red-400">Transaction Error</div>
            <div className="small-muted mt-2">{error}</div>
            <button
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white"
              onClick={() => setError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {txModal && <TransactionModal
      show={txModal.show}
      status={txModal.status}
      message={txModal.message}
      onClose={() => setTxModal({ show: false, status: null, message: "" })}
    />}

    </div>
  )
}
