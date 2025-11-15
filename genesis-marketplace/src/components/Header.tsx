//import React from 'react'
export default function Header({ onNavigate, lockerCount } : { onNavigate: (r:'home'|'locker')=>void, lockerCount:number}) {
  return (
    <header className="flex items-center justify-between py-6 p-6">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold tracking-wide">
          <span className="gold">Gene</span>sis
        </div>
        {/* <div className="bg-lux-gold text-white px-3 py-1 rounded-md font-medium">Marketplace</div> */}
      </div>

      <nav className="flex items-center gap-4">
        <button className="px-3 py-1 rounded-md hover:bg-white/5" onClick={()=>onNavigate('home')}>Home</button>
        <button
          onClick={()=>onNavigate('locker')}
          className="px-3 py-1 btn-fill rounded-md flex items-center gap-2 button-gold"
        >
          {/* locker icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#07100a" strokeWidth="1.5">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M7 7V5a5 5 0 0 1 10 0v2" />
          </svg>
          <span className="ml-1">{lockerCount}</span>
        </button>
      </nav>
    </header>
  )
}