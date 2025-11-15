import type { Product } from '../types.ts'

export default function ProductCard({ product, onBuy, onDetails }: {
   product: Product,
   onBuy: (product: Product)=>void, 
   onDetails?: (productId: number) => void
  }) {
  return (
    <article className={`card overflow-hidden relative ${!product.onSale || product.isRedeemed ? "opacity-50 pointer-events-none hover:scale-90" : " "}transition-transform duration-300 hover:scale-105 hover:shadow-lg`}>
      <img className="product-image" loading="lazy" src={product.image} alt={product.name} height="180" width='100%'/>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="gold font-bold text-sm small-muted">{product.manufacturer}</div>
            <div className="small-muted">Creator</div>
          </div>
          <div className="text-right">
            <div className="gold font-bold">₳{product.price}</div>
            <div className="small-muted text-sm">Price</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onBuy(product)}
            className="flex-1 px-3 py-2 rounded-md btn-fill button-gold disabled:opacity-50"
            disabled={!product.onSale || product.isRedeemed}
          >
            Buy
          </button>
          <button onClick={ () => onDetails && onDetails(product.id)} className="px-3 py-2 rounded-md border border-white/5 text-sm text-white/90 btn-fill">Details</button>
        </div>

        {(!product.onSale || product.isRedeemed) && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xl font-semibold pointer-events-none">
          {/* <div className="text-6xl mb-2 line-through"></div> */}
        </div>
        )}

      </div>
    </article>
  )
}