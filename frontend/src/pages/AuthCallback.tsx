import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!session) {
      navigate('/signin', { replace: true })
    } else if (!profile) {
      navigate('/signup', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [loading, session, profile, navigate])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white/40 text-sm">Signing you in…</p>
    </div>
  )
}
