import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignOut() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    signOut().then(() => {
      navigate('/signin', { replace: true })
      localStorage.removeItem('profile')
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white/40 text-sm">Signing you out…</p>
    </div>
  )
}
