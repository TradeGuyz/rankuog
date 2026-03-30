import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors'
  const labelClass =
    'block text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-1'

  async function handleGoogle() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setGoogleLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10 w-full max-w-[420px]">
        {/* Back button */}

        {/* Logo */}
        <div className="mb-6">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">Rank</span>
            <span className="text-[#d4af37]">UoG</span>
          </span>
          <p className="text-sm text-white/40 mt-1">University of Guyana GPA Leaderboard</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-white font-semibold mb-2">Check your email</p>
            <p className="text-sm text-white/40">
              We sent a magic link to <span className="text-white/70">{email}</span>.
              Click it to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                placeholder="you@uog.edu.gy"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#f5d97a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-sm py-3 rounded-lg transition-colors cursor-pointer mt-2"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white text-sm font-medium py-3 rounded-lg transition-colors cursor-pointer"
            >
              <FcGoogle size={18} />
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>
          </form>
        )}
      </div>
      <p className="text-xs text-white/25 text-center mt-4 max-w-[320px]">
        By signing in you agree to our{' '}
        <button
          onClick={() => navigate('/terms')}
          className="text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors cursor-pointer"
        >
          Terms of Service
        </button>
      </p>
      <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer mt-6"
        >
          <FiChevronLeft size={16} />
          Back to leaderboard
        </button>
    </div>
  )
}
