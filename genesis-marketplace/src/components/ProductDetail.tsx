type Props = {
  show: boolean;
  onClose: () => void;
  loading?: boolean;
  product: any | null; // chain result (toHuman) or { notFound: true } or { error: '...' }
};

export default function ProductDetail({ show, onClose, loading, product }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0f0f11] p-6 rounded-lg w-[90%] max-w-2xl text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Product Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading product details…</div>
        ) : product?.notFound ? (
          <div className="py-8 text-center text-gray-300">Sorry, we couldn't find this product in storage</div>
        ) : product?.error ? (
          <div className="py-8 text-center text-red-400">Error: {product.error}</div>
        ) : (
          // display the product fields returned by toHuman()
          <div className="space-y-3">
            <div><strong>ID:</strong> {product?.id ?? "—"}</div>
            <div><strong>Name:</strong> {product?.name ?? "—"}</div>
            <div><strong>Creator:</strong> {product?.genesisOwner ?? product?.genesisOwner?.toString() ?? "—"}</div>
            <div><strong>Current Owner:</strong> {product?.owner ?? product?.owner?.toString() ?? "—"}</div>
            <div><strong>Price:</strong> {product?.price ?? "—"}</div>
            <div><strong>Ownership Tally:</strong> {product?.holdersCount ?? "—"}</div>
            <div><strong>Metadata (Digital Signature):</strong> {product?.metadata ?? "—"}</div>
            <div><strong>Listed for Sell:</strong> {product?.onSale.toString() ?? "—"}</div>
            <div><strong>Redeemed:</strong> {product?.isRedeemed.toString() ?? "—"}</div>

            {/* If there are nested attributes or arrays, stringify them nicely */}
            {/* {product && (
              <pre className="bg-black/40 p-3 rounded text-xs overflow-x-auto mt-3">
                {JSON.stringify(product, null, 2)}
              </pre>
            )} */}
          </div>
        )}
      </div>
    </div>
  )
}