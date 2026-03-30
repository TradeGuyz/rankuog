import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const DEPARTMENTS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Natural Sciences',
  'Business',
]

export default function SignUp() {
  const { session, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [department, setDepartment] = useState('')
  const [enrolmentYear, setEnrolmentYear] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or already has a profile
  useEffect(() => {
    if (loading) return
    if (!session) navigate('/signin', { replace: true })
    else if (profile) navigate('/', { replace: true })
  }, [loading, session, profile, navigate])

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors'
  const labelClass =
    'block text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-1'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setError(null)
    setSubmitting(true)

    const { error } = await supabase.from('users').insert({
      id: session.user.id,
      email: session.user.email,
      display_name: displayName.trim(),
      student_id: studentId.trim(),
      department,
      enrolment_year: parseInt(enrolmentYear),
      email_verified: true,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    await refreshProfile()
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-10 w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-6">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">Rank</span>
            <span className="text-[#d4af37]">UoG</span>
          </span>
          <p className="text-sm text-white/40 mt-1">University of Guyana GPA Leaderboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Kevin Johnson"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
          </div>

          {/* Student ID */}
          <div>
            <label className={labelClass}>Student ID</label>
            <input
              type="text"
              className={inputClass}
              placeholder="202300198"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              required
            />
          </div>

          {/* Email (read-only from session) */}
          <div>
            <label className={labelClass}>Moodle Email</label>
            <input
              type="email"
              className={`${inputClass} opacity-50 cursor-not-allowed`}
              value={session?.user.email ?? ''}
              readOnly
            />
            <p className="text-[11px] text-white/30 mt-1">
              Confirmed via your sign-in method
            </p>
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Department</label>
            <select
              className={inputClass}
              value={department}
              onChange={e => setDepartment(e.target.value)}
              required
            >
              <option value="" disabled className="bg-[#111827] text-white/30">Select department</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d} className="bg-[#111827] text-white">{d}</option>
              ))}
            </select>
          </div>

          {/* Enrolment Year */}
          <div>
            <label className={labelClass}>Enrolment Year</label>
            <input
              type="number"
              className={inputClass}
              placeholder="2023"
              min={2000}
              max={2100}
              value={enrolmentYear}
              onChange={e => setEnrolmentYear(e.target.value)}
              required
            />
            <p className="text-[11px] text-white/30 mt-1">
              Year group (Year 1–4) is calculated automatically from this
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#d4af37] hover:bg-[#f5d97a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-sm py-3 rounded-lg transition-colors cursor-pointer mt-2"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
