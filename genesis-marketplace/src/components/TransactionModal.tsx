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
              onClick={onClose} 
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