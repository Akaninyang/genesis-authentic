import { useState, useEffect, useMemo } from "react"
import ProductCard from "../components/ProductCard.tsx"
import ProductDetail from "../components/ProductDetail.tsx"
import Footer from "../components/Footer.tsx"
import { connectApi, getProduct } from "../polkadotApi.ts"
import type { Product } from "../types.ts"

export default function Home({
  products,
  onBuy,
  connected,
  onConnectWallet
}: {
  products: Product[],
  onBuy: (product: Product) => void,
  connected: boolean,
  onConnectWallet: () => void
}) {
  useEffect(() => {
    connectApi()
  }, [])

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // --- New filter states ---
  const [selectedManufacturer, setSelectedManufacturer] = useState("All")
  const [nameFilter, setNameFilter] = useState("")

  // --- Dynamically get all unique manufacturers from frontend data ---
  const manufacturers = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.manufacturer)))
    return ["All", ...unique]
  }, [products])

  // --- Filter products by name and manufacturer ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchManufacturer =
        selectedManufacturer === "All" || p.manufacturer === selectedManufacturer
      const matchName = p.name.toLowerCase().includes(nameFilter.toLowerCase())
      return matchManufacturer && matchName
    })
  }, [products, selectedManufacturer, nameFilter])

  async function handleDetails(productId: number) {
    try {
      setLoadingDetails(true)
      setShowProductDetail(true)
      const chainProduct = await getProduct(productId)
      if (!chainProduct) {
        setSelectedProduct({ notFound: true, id: productId })
      } else {
        setSelectedProduct(chainProduct)
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err)
      setSelectedProduct({ error: (err as Error).message })
    } finally {
      setLoadingDetails(false)
    }
  }

  return (
    <div>
      {/* --- Hero Section --- */}
      <section
        className="relative text-center mb-0 py-20 bg-cover bg-center overflow-hidden h-[75vh]"
        style={{
          backgroundImage:
            "url('https://unsplash.com/photos/BQ9usyzHx_w/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZWNvbW1lcmNlfGVufDB8fHx8MTc2MjMxMjMyMnww&force=true')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-none"></div>

        <div className="relative z-10" id='hero-talk'>
          <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
            Don't just trust. <span className="text-yellow-400">Own the truth.</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-6 text-lg px-3">
            Experience e-commerce where every product is provably authentic. 
            Own it as an NFT, redeem it physically, and trade it securely on-chain.
          </p>

          <div className="flex justify-center space-x-4" id='hero-buttons'>
            <button onClick={() => {
              const el = document.getElementById('products-view');
              if (el) el.scrollIntoView({behavior: "smooth"});
            }} 
            className="px-5 py-3 btn-fill bg-yellow-500 text-black font-semibold rounded-lg">
              Explore Products
            </button>

            <button
              className={`px-5 py-3 font-semibold rounded-lg transition ${
                connected ? "bg-green-600 hover:bg-green-500" : "bg-blue-500 hover:bg-blue-400"
              } text-white`}
              onClick={onConnectWallet}
            >
              {connected ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </section>

      {/* --- Product Section with Filter Bar --- */}
      <section className="p-6">
        <div className="flex flex-wrap items-center justify-between mb-6 px-1 sm:px-0">
          <h2 className="text-2xl font-semibold">Featured Listings</h2>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end py-2">
              
              {/* --- Manufacturer Dropdown --- */}
              <div className="flex-1">
              <select
                value={selectedManufacturer}
                onChange={e => setSelectedManufacturer(e.target.value)}
                className="bg-[#0f0f11] border border-white/5 p-2 rounded-md small-muted w-full"
              >
                {manufacturers.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              </div>

              {/* --- Name Filter Input --- */}
              <div className="flex-1"> 
              <input
                placeholder="Filter by name"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="bg-[#0f0f11] border border-white/5 p-2 rounded-md small-muted w-full" 
              />
              </div>
              
          </div>
      </div>

        {/* --- Filtered Product Grid --- */}
        <div id = "products-view" className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(p => (
            <ProductCard product={p} onBuy={onBuy} onDetails={handleDetails} />
          ))}
          
        </div>
      </section>

      {/* --- Product Detail Modal --- */}
      {showProductDetail && (
        <ProductDetail
          show={showProductDetail}
          onClose={() => {
          setShowProductDetail(false)
          setSelectedProduct(null)
          }}
          loading={loadingDetails}
          product={selectedProduct}
        />
      )}

      <Footer />
    </div>
  )
}