// src/components/TransactionModal.tsx

// type TransactionModalProps = {
//   show: boolean;
//   status: "pending" | "success" | null;
//   message?: string;
//   onClose: () => void;
// };

// export default function TransactionModal({
//   show,
//   status,
//   message,
//   onClose,
// }: TransactionModalProps) {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//       <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm w-full">
//         <div className="mb-4">
//           {status === "pending" ? (
//             <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto" />
//           ) : (
//             <div className="text-4xl text-green-600">✓</div>
//           )}
//         </div>
//         <h2 className="text-lg font-semibold mb-2">
//           {status === "pending" ? "Transaction Sent" : "Success!"}
//         </h2>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <button
//           onClick={onClose}
//           className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }

type TransactionModalProps = {
  show: boolean;
  status: "pending" | "success" | "error" | null;
  message: string;
  onClose: () => void;
};

export default function TransactionModal({ show, status, message, onClose }: TransactionModalProps) {
  if (!show || !status) return null;

  let statusColor = "text-white";
  if (status === "success") statusColor = "text-green-400";
  if (status === "error") statusColor = "text-red-500";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-[#0f0f11] p-6 rounded-lg w-[400px] text-center">
        <h2 className={`text-2xl font-semibold mb-4 ${statusColor}`}>
          {status === "pending" ? "⏳ Processing Transaction" :
           status === "success" ? "✅ Success" :
           "❌ Error"}
        </h2>
        <p className="small-muted mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          {status === "pending" && (
            <button
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
              onClick={onClose} // Dismiss modal and continue browsing
            >
              Continue
            </button>
          )}
          {(status === "success" || status === "error") && (
            <button
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-md"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}