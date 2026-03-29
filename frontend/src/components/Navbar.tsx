import { useState } from 'react'

// Replace with real auth state when backend is ready
const mockUser = { name: 'Nick', initials: 'N' }

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <nav className="w-full bg-transparent border-b border-white/10">
      <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-white">Rank</span>
          <span className="text-[#d4af37]">UoG</span>
        </span>

        {loggedIn ? (
          <button
            onClick={() => setLoggedIn(false)}
            className="w-9 h-9 rounded-full bg-[#d4af37] text-[#0a0a0a] font-bold text-sm flex items-center justify-center hover:bg-[#f5d97a] transition-colors cursor-pointer"
            title={mockUser.name}
          >
            {mockUser.initials}
          </button>
        ) : (
          <button
            onClick={() => setLoggedIn(true)}
            className="px-4 py-1.5 rounded-md border border-[#d4af37] text-[#d4af37] text-sm font-medium hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}
