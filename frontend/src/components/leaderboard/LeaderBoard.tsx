import { useState, useMemo, useEffect } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Student, GpaPerYear } from '../../types'

// year_group = 2025 - enrolment_year + 1
// 2025 → Year 1, 2024 → Year 2, 2023 → Year 3, 2022 → Year 4
const CURRENT_ACADEMIC_START = 2025
const ACADEMIC_YEARS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023'] as const


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
  const { session, loading: authLoading } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

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
        .select('id, display_name, student_id, department, enrolment_year, overall_gpa, is_anonymous, gpa_per_year(academic_year, gpa)')
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
      }))
      setStudents(mapped)
      setLoadingData(false)
    }
    fetchLeaderboard()
  }, [authLoading, session?.user.id])

  const filtered = useMemo(() => {
    let list = students.filter(s => {
      if (yearFilter !== null && getYearGroup(s.enrolment_year, CURRENT_ACADEMIC_START) !== yearFilter) return false
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startIndex = (safePage - 1) * PAGE_SIZE

  function resetPage() { setPage(1) }

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-12">

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* GPA mode toggle */}
        <div className="flex rounded-md overflow-hidden border border-white/10">
          {[
            { label: 'Overall GPA', value: 'overall' },
            { label: ACADEMIC_YEARS[0], value: ACADEMIC_YEARS[0] },
            { label: ACADEMIC_YEARS[1], value: ACADEMIC_YEARS[1] },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setGpaMode(opt.value); resetPage() }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                gpaMode === opt.value
                  ? 'bg-[#d4af37] text-[#0a0a0a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
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

        {/* Search */}
        <div className="ml-auto hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
          <FiSearch size={13} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            className="bg-transparent text-xs text-white/80 placeholder-white/30 outline-none w-44"
          />
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
                const rank = startIndex + i + 1
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
                      <span className="text-sm font-mono text-white/60">Year {yearGroup}</span>
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
    </section>
  )
}
