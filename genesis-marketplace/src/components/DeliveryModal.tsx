import { useState } from "react";

export default function DeliveryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Delivery info:", { name, address, phone });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50`}>
      <div className={`bg-[#0f0f11] p-8 rounded-2xl w-80 shadow-2xl`}>

        <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">
          Delivery Information
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="bg-[#1a1a1d] text-white p-3 rounded-xl placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="bg-[#1a1a1d] text-white p-3 rounded-xl placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            placeholder="Home Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            className="bg-[#1a1a1d] text-white p-3 rounded-xl placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-yellow-400 text-black font-semibold p-3 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Submit
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 text-yellow-400 hover:text-yellow-300 w-full text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}