// import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"
// import { useState } from "react"

// type WalletModalProps = {
//   show: boolean
//   onClose: () => void
//   onConnect: (selectedAccount: InjectedAccountWithMeta) => void
//   accounts: InjectedAccountWithMeta[]
//   error: string | null
// }

// export default function WalletModal({ show, onClose, onConnect, accounts, error }: WalletModalProps) {
//   const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);

//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
//       <div className="bg-[#0f0f11] p-8 rounded-lg w-[400px] text-center">
//         <h2 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h2>
//         <p className="text-gray-400 mb-6">
//           Select an account to continue. If you don’t have Polkadot.js installed, get it here:  
//           <a
//             href="https://polkadot.js.org/extension/"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-yellow-400 hover:underline"
//           >
//             polkadot.js.org/extension
//           </a>
//           👈
//         </p>

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         <select
//           className="bg-[#0f0f11] border border-white/5 p-2 mb-4 rounded-md w-full"
//           value={selectedAccount?.address || ""}
//           onChange={(e) => {
//             const acc = accounts.find(a => a.address === e.target.value) || null;
//             setSelectedAccount(acc);
//           }}
//         >
//           <option value="">Select account</option>
//           {accounts.map((a) => (
//             <option key={a.address} value={a.address}>
//               {a.meta.name} - {a.address.slice(0, 6)}...
//             </option>
//           ))}
//         </select>

//         <div className="flex justify-center gap-4">
//           <button
//             onClick={() => selectedAccount && onConnect(selectedAccount)}
//             className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-md"
//           >
//             Connect Wallet
//           </button>
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"
import { useState } from "react"

type WalletModalProps = {
  show: boolean
  onClose: () => void
  onConnect: (selectedAccount: InjectedAccountWithMeta) => void
  accounts: InjectedAccountWithMeta[]
  error: string | null
}

export default function WalletModal({ show, onClose, onConnect, accounts, error }: WalletModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [animateHint, setAnimateHint] = useState(false);

  if (!show) return null;

  const handleConnect = () => {
    if (!selectedAccount || accounts.length === 0) {
      setAnimateHint(true);
      setTimeout(() => setAnimateHint(false), 500);   // reset animation
      return;
    }

    onConnect(selectedAccount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-[#0f0f11] p-8 rounded-lg w-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Select an account to continue. If you don’t have Polkadot.js installed, get it here:  
          <a
            href="https://polkadot.js.org/extension/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-yellow-400 hover:underline inline-block ${
              animateHint ? "animate-wiggle" : ""
            }`}
          >
            polkadot.js.org/extension
          </a>
          👈
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <select
          className="bg-[#0f0f11] border border-white/5 p-2 mb-4 rounded-md w-full"
          value={selectedAccount?.address || ""}
          onChange={(e) => {
            const acc = accounts.find(a => a.address === e.target.value) || null;
            setSelectedAccount(acc);
          }}
        >
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.address} value={a.address}>
              {a.meta.name} - {a.address.slice(0, 6)}...
            </option>
          ))}
        </select>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleConnect}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-md"
          >
            Connect Wallet
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}