import { useState, useMemo, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiEdit2, FiX } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Student, GpaPerYear } from '../../types'
import verifiedIcon from '../../assets/verified.png'

function getAcademicYearStart(): number {
  const now = new Date()
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

const CURRENT_ACADEMIC_START = getAcademicYearStart()
const ACADEMIC_YEARS = Array.from({ length: 4 }, (_, i) => {
  const s = CURRENT_ACADEMIC_START - i
  return `${s}/${s + 1}`
})


const DEPT_STYLES: Record<string, string> = {
  'Computer Science':        'bg-blue-900/60 text-blue-300 border border-blue-700/40',
  'Information Systems':     'bg-cyan-900/60 text-cyan-300 border border-cyan-700/40',
  'Engineering':             'bg-orange-900/60 text-orange-300 border border-orange-700/40',
  'Natural Sciences':        'bg-green-900/60 text-green-300 border border-green-700/40',
  'Agriculture & Forestry':  'bg-lime-900/60 text-lime-300 border border-lime-700/40',
  'Environmental Studies':   'bg-teal-900/60 text-teal-300 border border-teal-700/40',
  'Social Sciences':         'bg-violet-900/60 text-violet-300 border border-violet-700/40',
  'Medical Sciences':        'bg-pink-900/60 text-pink-300 border border-pink-700/40',
  'Behavioural Sciences':    'bg-rose-900/60 text-rose-300 border border-rose-700/40',
  'Business & Entrepreneurship': 'bg-purple-900/60 text-purple-300 border border-purple-700/40',
  'Education & Humanities':  'bg-amber-900/60 text-amber-300 border border-amber-700/40',
}

const RANK_STYLES = [
  { bg: '#d4af37', text: '#0a0a0a' },
  { bg: '#9ca3af', text: '#0a0a0a' },
  { bg: '#b45309', text: '#fff' },
]

const PAGE_SIZE = 25
const DEPARTMENTS = [
  'Computer Science',
  'Information Systems',
  'Engineering',
  'Natural Sciences',
  'Agriculture & Forestry',
  'Environmental Studies',
  'Social Sciences',
  'Medical Sciences',
  'Behavioural Sciences',
  'Business & Entrepreneurship',
  'Education & Humanities',
]
const YEAR_GROUPS = [1, 2, 3, 4]

function getYearGroup(enrolment_year: number, academicStart: number): number {
  return academicStart - enrolment_year + 1
}

function getGpa(student: Student, mode: string): number {
  if (mode === 'overall') return student.overall_gpa
  const entry = student.gpa_per_year.find(y => y.academic_year === mode)
  return entry ? entry.gpa : 0
}

export default function LeaderBoard() {
  const { session, loading: authLoading, profile, refreshProfile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [gpaOpen, setGpaOpen] = useState(false)
  const [userGpaYears, setUserGpaYears] = useState<GpaPerYear[]>([])
  const [selectedYearKey, setSelectedYearKey] = useState('')
  const [gpaYear, setGpaYear] = useState('')
  const [gpaOverall, setGpaOverall] = useState('')
  const [gpaSaving, setGpaSaving] = useState(false)
  const [gpaError, setGpaError] = useState<string | null>(null)

  const [gpaMode, setGpaMode] = useState<string>('overall')
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [deptFilter, setDeptFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (authLoading) return
    async function fetchLeaderboard() {
      setLoadingData(true)
      setFetchError(null)
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, student_id, department, enrolment_year, overall_gpa, is_anonymous, user_verified, gpa_per_year(academic_year, gpa)')
        .eq('email_verified', true)
        .not('overall_gpa', 'is', null)
      if (error) {
        setFetchError(error.message)
        setLoadingData(false)
        return
      }
      const currentUserId = session?.user.id
      const mapped: Student[] = (data ?? []).map(row => ({
        id: row.id,
        display_name: row.is_anonymous ? 'Anonymous' : row.display_name,
        student_id: row.is_anonymous ? '—' : row.student_id,
        department: row.department,
        enrolment_year: row.enrolment_year,
        overall_gpa: Number(row.overall_gpa),
        gpa_per_year: (row.gpa_per_year as GpaPerYear[]) ?? [],
        is_current_user: row.id === currentUserId,
        user_verified: row.user_verified ?? false,
      }))
      setStudents(mapped)
      setLoadingData(false)
    }
    fetchLeaderboard()
  }, [authLoading, session?.user.id, refreshKey])

  const filtered = useMemo(() => {
    const academicStart = gpaMode === 'overall' ? CURRENT_ACADEMIC_START : parseInt(gpaMode.split('/')[0], 10)
    let list = students.filter(s => {
      if (gpaMode !== 'overall' && s.enrolment_year > academicStart) return false
      if (gpaMode !== 'overall' && !s.gpa_per_year.some(y => y.academic_year === gpaMode)) return false
      if (yearFilter !== null && getYearGroup(s.enrolment_year, academicStart) !== yearFilter) return false
      if (deptFilter !== null && s.department !== deptFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.display_name.toLowerCase().includes(q) && !s.student_id.includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => getGpa(b, gpaMode) - getGpa(a, gpaMode))
    return list
  }, [students, yearFilter, deptFilter, search, gpaMode])

  const ranksMap = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((student, i) => {
      const gpa = getGpa(student, gpaMode)
      if (i > 0 && getGpa(filtered[i - 1], gpaMode) === gpa) {
        map.set(student.id, map.get(filtered[i - 1].id)!)
      } else {
        map.set(student.id, i + 1)
      }
    })
    return map
  }, [filtered, gpaMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startIndex = (safePage - 1) * PAGE_SIZE

  function resetPage() { setPage(1) }

  const currentYearKey = `${CURRENT_ACADEMIC_START}/${CURRENT_ACADEMIC_START + 1}`
  const availableYears: string[] = []
  if (profile) {
    const upperBound = Math.min(CURRENT_ACADEMIC_START, profile.enrolment_year + 3)
    for (let y = profile.enrolment_year; y <= upperBound; y++) {
      availableYears.push(`${y}/${y + 1}`)
    }
  }

  async function openGpa() {
    if (!profile) return
    const { data } = await supabase
      .from('gpa_per_year')
      .select('academic_year, gpa')
      .eq('user_id', profile.id)
    const years: GpaPerYear[] = data ?? []
    setUserGpaYears(years)
    const row = years.find(r => r.academic_year === currentYearKey)
    setSelectedYearKey(currentYearKey)
    setGpaYear(row ? row.gpa.toFixed(2) : '')
    setGpaOverall(profile.overall_gpa != null ? profile.overall_gpa.toFixed(2) : '')
    setGpaError(null)
    setGpaOpen(true)
  }

  function handleYearChange(key: string) {
    setSelectedYearKey(key)
    const row = userGpaYears.find(r => r.academic_year === key)
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
    await refreshProfile()
    setRefreshKey(k => k + 1)
    setGpaSaving(false)
    setGpaOpen(false)
  }

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-12">

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* GPA mode dropdown */}
        <div className="relative">
          <select
            value={gpaMode}
            onChange={e => { setGpaMode(e.target.value); setYearFilter(null); resetPage() }}
            className="appearance-none bg-[#111827] border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-white/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
          >
            <option value="overall" className="bg-[#111827] text-white">Overall GPA</option>
            {ACADEMIC_YEARS.map(y => (
              <option key={y} value={y} className="bg-[#111827] text-white">{y}</option>
            ))}
          </select>
          <FiChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
        </div>

        {/* Year group dropdown */}
        <div className="relative">
          <select
            value={yearFilter ?? ''}
            onChange={e => { setYearFilter(e.target.value ? Number(e.target.value) : null); resetPage() }}
            className="appearance-none bg-[#111827] border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-white/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
          >
            <option value="" className="bg-[#111827] text-white">All years</option>
            {YEAR_GROUPS.map(y => (
              <option key={y} value={y} className="bg-[#111827] text-white">Year {y}</option>
            ))}
          </select>
          <FiChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
        </div>

        {/* Department dropdown */}
        <div className="relative">
          <select
            value={deptFilter ?? ''}
            onChange={e => { setDeptFilter(e.target.value || null); resetPage() }}
            className="appearance-none bg-[#111827] border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-white/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
          >
            <option value="" className="bg-[#111827] text-white">All departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d} className="bg-[#111827] text-white">{d}</option>
            ))}
          </select>
          <FiChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
        </div>

        {/* Search + Update GPA */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
            <FiSearch size={13} className="text-white/40 shrink-0" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage() }}
              className="bg-transparent text-xs text-white/80 placeholder-white/30 outline-none w-44"
            />
          </div>
          {session && (
            <button
              onClick={openGpa}
              className="p-2 rounded-md border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Update GPA"
            >
              <FiEdit2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {['#', 'STUDENT', 'DEPARTMENT', 'YEAR', 'GPA'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-white/40 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingData ? (
              <tr><td colSpan={5} className="py-12 text-center text-white/30 text-sm">Loading...</td></tr>
            ) : fetchError ? (
              <tr><td colSpan={5} className="py-12 text-center text-red-400/70 text-sm">Failed to load leaderboard</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-white/30 text-sm">No results found</td></tr>
            ) : (
              pageItems.map((student, i) => {
                const rank = ranksMap.get(student.id) ?? startIndex + i + 1
                const gpa = getGpa(student, gpaMode)
                const academicStart = gpaMode === 'overall' ? CURRENT_ACADEMIC_START : parseInt(gpaMode.split('/')[0], 10)
                const yearGroup = getYearGroup(student.enrolment_year, academicStart)
                const isUser = student.is_current_user

                return (
                  <tr
                    key={student.id}
                    className={`border-b border-white/5 last:border-0 transition-colors ${
                      isUser
                        ? 'border-l-2 border-l-[#d4af37] bg-[#d4af37]/5'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center">
                        {rank <= 3 ? (
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{ backgroundColor: RANK_STYLES[rank - 1].bg, color: RANK_STYLES[rank - 1].text }}
                          >
                            {rank}
                          </span>
                        ) : (
                          <span className="text-sm text-white/30 font-mono w-6 text-center">{rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col justify-center gap-px">
                        <div className="flex items-center gap-2 leading-none">
                          <span className="text-sm font-medium text-white whitespace-nowrap">{student.display_name}</span>
                          {student.user_verified && (
                            <img src={verifiedIcon} alt="Verified" className="w-4 h-4 inline-block shrink-0" />
                          )}
                          {isUser && (
                            <span className="text-[9px] font-bold bg-[#d4af37] text-[#0a0a0a] px-1.5 py-0.5 rounded-sm tracking-widest shrink-0">YOU</span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40 font-mono leading-none">{student.student_id}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DEPT_STYLES[student.department] ?? 'bg-white/10 text-white/60'}`}>
                        {student.department}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-mono text-white/60">{yearGroup > 4 ? 'Grad' : `Year ${yearGroup}`}</span>
                    </td>

                    {/* GPA bar + value */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 bg-white/10 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-emerald-400"
                            style={{ width: `${(gpa / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-white w-10 text-right">
                          {gpa.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-xs text-white/40">
          {filtered.length === 0
            ? 'No results'
            : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded text-xs font-mono cursor-pointer transition-colors ${
                  p === safePage
                    ? 'bg-[#d4af37] text-[#0a0a0a] font-bold'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
            {safePage < totalPages && (
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="w-7 h-7 rounded text-xs text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                →
              </button>
            )}
          </div>
        )}
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
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-white">Update GPA</h3>
              <button onClick={() => setGpaOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-white/40 mb-6">Enter your GPA on the 4.0 scale.</p>

            <div className="flex flex-col gap-4">
              {/* Academic Year */}
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-white/40">Academic Year</label>
                <div className="relative mt-1">
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
                <label className="text-[10px] font-semibold tracking-widest uppercase text-white/40">Academic Year GPA</label>
                <input
                  type="number"
                  min={0} max={4} step={0.01}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 3.85"
                  value={gpaYear}
                  onChange={e => setGpaYear(e.target.value)}
                  autoFocus
                />
                <p className="text-[11px] text-white/30 mt-1">GPA for the selected academic year only (0.00 – 4.00)</p>
              </div>

              {/* Overall GPA */}
              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase text-white/40">Overall GPA (Cumulative)</label>
                <input
                  type="number"
                  min={0} max={4} step={0.01}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g. 3.72"
                  value={gpaOverall}
                  onChange={e => setGpaOverall(e.target.value)}
                />
                <p className="text-[11px] text-white/30 mt-1">Your cumulative GPA across all semesters</p>
              </div>

              {gpaError && <p className="text-xs text-red-400">{gpaError}</p>}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleGpaSubmit}
                  disabled={gpaSaving}
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
    </section>
  )
}
