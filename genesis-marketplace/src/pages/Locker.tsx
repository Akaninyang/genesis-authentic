import type { Product } from '../types.ts'
import LockerItem from '../components/LockerItem.tsx'

export default function Locker({ locker, onToggleSale, onRedeem } : { 
  locker: Product[], 
  onToggleSale:(product: Product, forSale: boolean) => void
  onRedeem:(product: Product) => void
}) {
  return (
    <section className = "p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Vault</h2>
      {locker.length === 0 ? (
        <div className="card p-6 small-muted">No items yet — buy something lovely, you deserve it.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {locker.map(it => <LockerItem key={it.id} product={it} onToggleSale={onToggleSale} onRedeem={onRedeem}/>)}
        </div>
      )}
    </section>
  )
}