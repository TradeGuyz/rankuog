import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav className="w-full bg-transparent border-b border-white/10">
      <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
        <span
          onClick={() => navigate('/')}
          className="text-2xl font-bold tracking-tight cursor-pointer"
        >
          <span className="text-white">Rank</span>
          <span className="text-[#d4af37]">UoG</span>
        </span>

        {session ? (
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-[#d4af37] text-[#0a0a0a] font-bold text-sm flex items-center justify-center hover:bg-[#f5d97a] transition-colors cursor-pointer"
            title={profile?.display_name ?? 'Account'}
          >
            {initials}
          </button>
        ) : (
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-1.5 rounded-md border border-[#d4af37] text-[#d4af37] text-sm font-medium hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  )
}
