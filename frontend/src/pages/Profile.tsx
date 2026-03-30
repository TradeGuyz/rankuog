import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronDown, FiEdit2, FiX } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const labelClass = 'text-[10px] font-semibold tracking-widest uppercase text-white/40'

interface ProfileStats {
  globalRank: number
  globalTotal: number
  yearGroupRank: number
  yearGroupTotal: number
  deptRank: number
  deptTotal: number
}

interface GpaYearRow {
  academic_year: string
  gpa: number
  updated_at: string | null
}

function getAcademicYearStart(): number {
  const now = new Date()
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getYearLabel(academicYear: string, enrolmentYear: number, currentYearStart: number): string {
  const yearStart = parseInt(academicYear.split('/')[0])
  if (yearStart === currentYearStart) return 'Current year'
  return `Year ${yearStart - enrolmentYear + 1}`
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative w-11 h-6 rounded-full flex-shrink-0 ${on ? 'bg-[#d4af37]' : 'bg-white/20'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { session, loading, profile, refreshProfile, signOut } = useAuth()
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [gpaYears, setGpaYears] = useState<GpaYearRow[]>([])
  const [anonymousSaving, setAnonymousSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [gpaOpen, setGpaOpen] = useState(false)
  const [selectedYearKey, setSelectedYearKey] = useState('')
  const [gpaYear, setGpaYear] = useState('')
  const [gpaOverall, setGpaOverall] = useState('')
  const [gpaSaving, setGpaSaving] = useState(false)
  const [gpaError, setGpaError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!session) navigate('/signin', { replace: true })
  }, [loading, session, navigate])

  async function fetchData() {
    if (!profile) return

    const gpaYearsRes = await supabase
      .from('gpa_per_year')
      .select('academic_year, gpa, updated_at')
      .eq('user_id', profile.id)
      .order('academic_year', { ascending: false })

    setGpaYears(
      (gpaYearsRes.data ?? []).map((r) => ({
        academic_year: r.academic_year,
        gpa: Number(r.gpa),
        updated_at: r.updated_at ?? null,
      }))
    )

    if (profile.overall_gpa == null) return

    const [
      globalRankRes, globalTotalRes,
      yearRankRes, yearTotalRes,
      deptRankRes, deptTotalRes,
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true })
        .gt('overall_gpa', profile.overall_gpa)
        .eq('email_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .not('overall_gpa', 'is', null)
        .eq('email_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .gt('overall_gpa', profile.overall_gpa)
        .eq('email_verified', true)
        .eq('enrolment_year', profile.enrolment_year),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .not('overall_gpa', 'is', null)
        .eq('email_verified', true)
        .eq('enrolment_year', profile.enrolment_year),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .gt('overall_gpa', profile.overall_gpa)
        .eq('email_verified', true)
        .eq('department', profile.department),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .not('overall_gpa', 'is', null)
        .eq('email_verified', true)
        .eq('department', profile.department),
    ])

    setStats({
      globalRank: (globalRankRes.count ?? 0) + 1,
      globalTotal: globalTotalRes.count ?? 0,
      yearGroupRank: (yearRankRes.count ?? 0) + 1,
      yearGroupTotal: yearTotalRes.count ?? 0,
      deptRank: (deptRankRes.count ?? 0) + 1,
      deptTotal: deptTotalRes.count ?? 0,
    })
  }

  useEffect(() => {
    fetchData()
  }, [profile])

  if (loading || !session || !profile) return null

  const yearStart = getAcademicYearStart()
  const yearGroup = yearStart - profile.enrolment_year + 1
  const initials = getInitials(profile.display_name)

  const profileStats = [
    {
      label: 'Global Rank',
      value: stats ? `#${stats.globalRank}` : '—',
      sub: stats ? `of ${stats.globalTotal} students` : '—',
    },
    {
      label: `Year ${yearGroup} Rank`,
      value: stats ? `#${stats.yearGroupRank}` : '—',
      sub: stats ? `of ${stats.yearGroupTotal} Year ${yearGroup}s` : '—',
    },
    {
      label: 'Overall GPA',
      value: profile.overall_gpa != null ? profile.overall_gpa.toFixed(2) : '—',
      sub: 'cumulative',
    },
    {
      label: `${profile.department} Rank`,
      value: stats ? `#${stats.deptRank}` : '—',
      sub: stats ? `of ${stats.deptTotal} ${profile.department} students` : '—',
    },
  ]

  function openEdit() {
    if (!profile) return
    setEditName(profile.display_name)
    setEditError(null)
    setEditOpen(true)
  }

  async function handleEditSave() {
    if (!profile) return
    if (!editName.trim()) return
    setEditSaving(true)
    setEditError(null)
    const { error } = await supabase
      .from('users')
      .update({ display_name: editName.trim() })
      .eq('id', profile.id)
    if (error) {
      setEditError(error.message)
      setEditSaving(false)
      return
    }
    await refreshProfile()
    setEditSaving(false)
    setEditOpen(false)
  }

  const currentYearKey = `${yearStart}/${yearStart + 1}`
  const currentYearRow = gpaYears.find(r => r.academic_year === currentYearKey)

  const availableYears: string[] = []
  for (let y = 2023; y <= yearStart; y++) {
    availableYears.push(`${y}/${y + 1}`)
  }

  const selectedYearRow = gpaYears.find(r => r.academic_year === selectedYearKey)
  const lastUpdated = selectedYearRow?.updated_at ? new Date(selectedYearRow.updated_at) : null
  const hoursSince = lastUpdated ? (Date.now() - lastUpdated.getTime()) / 36e5 : Infinity
  const rateLimited = hoursSince < 24
  const hoursRemaining = rateLimited ? Math.ceil(24 - hoursSince) : 0


  function openGpa() {
    if (!profile) return
    setSelectedYearKey(currentYearKey)
    const row = gpaYears.find(r => r.academic_year === currentYearKey)
    setGpaYear(row ? row.gpa.toFixed(2) : '')
    setGpaOverall(profile.overall_gpa != null ? profile.overall_gpa.toFixed(2) : '')
    setGpaError(null)
    setGpaOpen(true)
  }

  function handleYearChange(key: string) {
    setSelectedYearKey(key)
    const row = gpaYears.find(r => r.academic_year === key)
    setGpaYear(row ? row.gpa.toFixed(2) : '')
    setGpaError(null)
  }

  async function handleGpaSubmit() {
    if (!profile) return
    const yearVal = parseFloat(gpaYear)
    const overallVal = parseFloat(gpaOverall)
    if (isNaN(yearVal) || yearVal < 0 || yearVal > 4) {
      setGpaError('Academic year GPA must be between 0.00 and 4.00')
      return
    }
    if (isNaN(overallVal) || overallVal < 0 || overallVal > 4) {
      setGpaError('Overall GPA must be between 0.00 and 4.00')
      return
    }
    setGpaSaving(true)
    setGpaError(null)
    const [upsertRes, updateRes] = await Promise.all([
      supabase.from('gpa_per_year').upsert(
        { user_id: profile.id, academic_year: selectedYearKey, gpa: yearVal },
        { onConflict: 'user_id,academic_year' }
      ),
      supabase.from('users').update({ overall_gpa: overallVal }).eq('id', profile.id),
    ])
    const err = upsertRes.error ?? updateRes.error
    if (err) {
      setGpaError(err.message)
      setGpaSaving(false)
      return
    }
    await Promise.all([refreshProfile(), fetchData()])
    setGpaSaving(false)
    setGpaOpen(false)
  }

  async function handleAnonymousToggle() {
    if (!profile || anonymousSaving) return
    setAnonymousSaving(true)
    const { error } = await supabase
      .from('users')
      .update({ is_anonymous: !profile.is_anonymous })
      .eq('id', profile.id)
    if (!error) await refreshProfile()
    setAnonymousSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-[1000px] mx-auto px-6 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer mb-6"
        >
          <FiChevronLeft size={16} />
          Back to leaderboard
        </button>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-white/40 mt-1">Manage your GPA entries and account settings</p>
        </div>

        {/* Profile summary card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 md:px-8 py-5 md:py-6 mb-5">
          <div className="flex items-start justify-between mb-5 md:mb-6">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Avatar — hidden on small screens */}
              <div className="hidden md:flex w-16 h-16 rounded-full bg-[#d4af37] items-center justify-center flex-shrink-0">
                <span className="text-[#0a0a0a] font-bold text-xl">{initials}</span>
              </div>

              {/* Name + info */}
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-white">{profile.display_name}</h2>
                <p className="text-xs md:text-sm text-white/40 mt-1 flex flex-wrap items-center gap-x-1.5 md:gap-x-2">
                  <span className="font-mono">{profile.student_id}</span>
                  <span className="text-white/20">·</span>
                  <span>{profile.department}</span>
                  <span className="text-white/20">·</span>
                  <span>Year {yearGroup}</span>
                  <span className="text-white/20">·</span>
                  <span>{profile.enrolment_year}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-[#d4af37]">{profile.email}</span>
                </p>
              </div>
            </div>

            {/* Edit Profile button */}
            <button onClick={openEdit} className="hidden md:block p-2 rounded-lg border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0" title="Edit Profile">
              <FiEdit2 size={15} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 md:pt-5 border-t border-white/10">
            {profileStats.map(s => (
              <div key={s.label}>
                <p className={`${labelClass} mb-1`}>{s.label}</p>
                <p className="text-xl md:text-3xl font-bold text-[#d4af37]">{s.value}</p>
                <p className="text-[11px] md:text-xs text-white/30 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* GPA by Academic Year */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex flex-col">
            <p className={`${labelClass} mb-5`}>GPA by Academic Year</p>

            <div className="flex flex-col gap-5 flex-1">
              {gpaYears.length === 0 ? (
                <p className="text-sm text-white/30">No GPA entries yet.</p>
              ) : (
                gpaYears.map(row => (
                  <div key={row.academic_year}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-white">{row.academic_year}</span>
                        <span className="text-xs text-white/30 ml-2">
                          {getYearLabel(row.academic_year, profile.enrolment_year, yearStart)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white">{row.gpa.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#d4af37] rounded-full"
                        style={{ width: `${(row.gpa / 4.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Update GPA */}
            <div className="flex items-center gap-3 mt-6">
              <button onClick={openGpa} className="px-4 py-2 bg-[#d4af37] hover:bg-[#f5d97a] text-[#0a0a0a] text-sm font-bold rounded-lg transition-colors cursor-pointer">
                <span className="hidden md:inline">Update GPA</span>
                <span className="md:hidden">Update</span>
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex flex-col">
            <p className={`${labelClass} mb-5`}>Account Settings</p>

            <div className="flex flex-col gap-5 flex-1">
              {/* Anonymous mode */}
              <div
                onClick={handleAnonymousToggle}
                className={`flex items-center justify-between gap-4 cursor-pointer ${anonymousSaving ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Anonymous mode</p>
                  <p className="text-xs text-white/40 mt-0.5">Hide your real name on the leaderboard</p>
                </div>
                <Toggle on={profile.is_anonymous} />
              </div>

              {/* Email notifications */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Email notifications</p>
                  <p className="text-xs text-white/40 mt-0.5">Notify me when my rank changes</p>
                </div>
                <Toggle on={true} />
              </div>
            </div>

          </div>

        </div>

        {/* Sign out + Delete Account */}
        <div className="mt-8 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm font-medium hover:border-red-500/70 hover:text-red-300 transition-colors cursor-pointer">
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg border border-red-500/40 text-red-400 text-sm font-medium hover:border-red-500/70 hover:text-red-300 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

      </div>

      {/* Update GPA Modal */}
      {gpaOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={() => setGpaOpen(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl px-8 py-8 w-full max-w-[400px]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Update GPA</h3>
              <button onClick={() => setGpaOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-6">Enter your GPA on the 4.0 scale. You can update once every 24 hours.</p>

            <div className="flex flex-col gap-4">
              {/* Academic Year */}
              <div>
                <label className={labelClass}>Academic Year</label>
                <div className="relative">
                  <select
                    value={selectedYearKey}
                    onChange={e => handleYearChange(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-9 text-sm text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                  >
                    {availableYears.map(y => (
                      <option key={y} value={y} className="bg-[#1a1a1a] text-white">
                        {y}{y === currentYearKey ? ' (current)' : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>

              {/* Academic Year GPA */}
              <div>
                <label className={labelClass}>Academic Year GPA</label>
                <input
                  type="number"
                  min={0} max={4} step={0.01}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 3.85"
                  value={gpaYear}
                  onChange={e => setGpaYear(e.target.value)}
                  autoFocus
                />
                <p className="text-[11px] text-white/30 mt-1">GPA for the selected academic year only (0.00 – 4.00)</p>
              </div>

              {/* Overall GPA */}
              <div>
                <label className={labelClass}>Overall GPA (Cumulative)</label>
                <input
                  type="number"
                  min={0} max={4} step={0.01}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 3.72"
                  value={gpaOverall}
                  onChange={e => setGpaOverall(e.target.value)}
                />
                <p className="text-[11px] text-white/30 mt-1">Your cumulative GPA across all semesters</p>
              </div>

              {rateLimited && (
                <p className="text-xs text-yellow-400">You can update again in {hoursRemaining} hour{hoursRemaining !== 1 ? 's' : ''}.</p>
              )}
              {gpaError && <p className="text-xs text-red-400">{gpaError}</p>}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleGpaSubmit}
                  disabled={gpaSaving || rateLimited}
                  className="flex-1 bg-[#d4af37] hover:bg-[#f5d97a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {gpaSaving ? 'Submitting…' : 'Submit GPA'}
                </button>
                <button
                  onClick={() => setGpaOpen(false)}
                  className="flex-1 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl px-8 py-8 w-full max-w-[400px]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-6">Update your display name. Student ID and email cannot be changed.</p>

            <div className="flex flex-col gap-4">
              {/* Display Name */}
              <div>
                <label className={labelClass}>Display Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Student ID (read-only) */}
              <div>
                <label className={labelClass}>Student ID</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white opacity-50 cursor-not-allowed"
                  value={profile.student_id}
                  readOnly
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className={labelClass}>Moodle Email</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white opacity-50 cursor-not-allowed"
                  value={profile.email}
                  readOnly
                />
              </div>

              {editError && <p className="text-xs text-red-400">{editError}</p>}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleEditSave}
                  disabled={editSaving || !editName.trim()}
                  className="flex-1 bg-[#d4af37] hover:bg-[#f5d97a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
