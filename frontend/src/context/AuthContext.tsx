import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  email: string
  student_id: string
  display_name: string
  department: string
  enrolment_year: number
  overall_gpa: number | null
  email_verified: boolean
  is_anonymous: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      setProfile(null)
    } else {
      setProfile(data ?? null)
    }
  }

  async function refreshProfile() {
    if (session?.user.id) {
      await fetchProfile(session.user.id)
    }
  }

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    setSession(null)
    setProfile(null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile(session.user.id).finally(() => setLoading(false))
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [session?.user.id])

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
