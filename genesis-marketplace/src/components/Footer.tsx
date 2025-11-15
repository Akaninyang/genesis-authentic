export default function Footer() {
  return (
    <footer className="bg-[#0f0f11] border-t border-white/5 text-gray-400 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} <span className="text-yellow-400 font-semibold">LuxChain</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="hover:text-yellow-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-yellow-400 transition">Terms of Service</a>
          <a href="#" className="hover:text-yellow-400 transition">Contact</a>
        </div>
      </div>
    </footer>
  )
}