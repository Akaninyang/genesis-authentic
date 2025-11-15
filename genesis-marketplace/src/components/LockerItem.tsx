import type { Product } from '../types.ts'
//import {products} from '../data/products.ts'

export default function LockerItem({ product, onToggleSale, onRedeem } : { product: Product, onToggleSale: (product: Product, forSale: boolean) => void, onRedeem: (product: Product) => void}) {
  return (
    <div className="card p-4 flex gap-4 items-center">
      <img src={product.image} className="w-36 h-24 rounded-md object-cover" alt={product.name} />
      <div className="flex-1">
        <div className="font-semibold">{product.name}</div>
        <div className="small-muted text-sm">{product.manufacturer}</div>
        <div className="mt-2 small-muted">Price: ₳{product.price}</div>
      </div>
      <div className="flex flex-col gap-2">
        <button 
        onClick ={()=> onRedeem(product)}
        disabled={product.isRedeemed} 
        className={`px-3 py-1 btn-fill rounded-md button-gold transition ${product.isRedeemed ? 'pointer-events-none line-through opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}>
          Redeem
        </button>
        <button 
        onClick ={()=> onToggleSale(product, true)}
        disabled={product.onSale || product.isRedeemed} 
        className={`px-3 py-1 btn-fill rounded-md border border-white/5 transition ${product.onSale || product.isRedeemed ? 'pointer-events-none line-through opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}>
          List
        </button>
        <button 
        onClick ={()=> onToggleSale(product, false)}
        disabled={!product.onSale || product.isRedeemed} 
        className={`px-3 py-1 btn-fill rounded-md border border-white/5 transition ${!product.onSale || product.isRedeemed ? 'pointer-events-none line-through opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}>
          Unlist
        </button>
      </div>
    </div>
  )
}