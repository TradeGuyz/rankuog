import { useState, useMemo } from 'react'

interface GpaPerYear {
  academic_year: string
  gpa: number
}

interface Student {
  id: string
  display_name: string
  student_id: string
  department: string
  overall_gpa: number
  enrolment_year: number
  gpa_per_year: GpaPerYear[]
  is_current_user?: boolean
}

// year_group = 2025 - enrolment_year + 1
// 2025 → Year 1, 2024 → Year 2, 2023 → Year 3, 2022 → Year 4
const CURRENT_ACADEMIC_START = 2025
const ACADEMIC_YEARS = ['2025/2026', '2024/2025'] as const

const DUMMY_STUDENTS: Student[] = [
  {
    id: '1', display_name: 'Priya Sharma', student_id: '202100234',
    department: 'Computer Science', overall_gpa: 3.98, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.95 }, { academic_year: '2024/2025', gpa: 3.97 }],
  },
  {
    id: '2', display_name: 'Marcus Williams', student_id: '202100089',
    department: 'Engineering', overall_gpa: 3.94, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.90 }, { academic_year: '2024/2025', gpa: 3.93 }],
  },
  {
    id: '3', display_name: 'Aisha Mohammed', student_id: '202200156',
    department: 'Computer Science', overall_gpa: 3.91, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.88 }, { academic_year: '2024/2025', gpa: 3.91 }],
  },
  {
    id: '4', display_name: 'Daniel Fernandes', student_id: '202100312',
    department: 'Medicine', overall_gpa: 3.88, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.85 }, { academic_year: '2024/2025', gpa: 3.87 }],
  },
  {
    id: '5', display_name: 'Simone Baptiste', student_id: '202200078',
    department: 'Natural Sciences', overall_gpa: 3.85, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.92 }, { academic_year: '2024/2025', gpa: 3.80 }],
  },
  {
    id: '6', display_name: 'Rohit Persaud', student_id: '202100445',
    department: 'Computer Science', overall_gpa: 3.82, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.78 }, { academic_year: '2024/2025', gpa: 3.84 }],
  },
  {
    id: '7', display_name: 'Tamara Singh', student_id: '202300021',
    department: 'Business', overall_gpa: 3.80, enrolment_year: 2024,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.80 }, { academic_year: '2024/2025', gpa: 3.75 }],
  },
  {
    id: '8', display_name: 'Kevin Johnson', student_id: '202300198',
    department: 'Computer Science', overall_gpa: 3.72, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.68 }, { academic_year: '2024/2025', gpa: 3.75 }],
    is_current_user: true,
  },
  {
    id: '9', display_name: 'Farah Ali', student_id: '202200289',
    department: 'Medicine', overall_gpa: 3.70, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.65 }, { academic_year: '2024/2025', gpa: 3.72 }],
  },
  {
    id: '10', display_name: 'Leon Rodrigues', student_id: '202100567',
    department: 'Engineering', overall_gpa: 3.68, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.60 }, { academic_year: '2024/2025', gpa: 3.70 }],
  },
  {
    id: '11', display_name: 'Natasha Henry', student_id: '202300445',
    department: 'Natural Sciences', overall_gpa: 3.65, enrolment_year: 2024,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.70 }, { academic_year: '2024/2025', gpa: 3.60 }],
  },
  {
    id: '12', display_name: 'Omar Khan', student_id: '202200391',
    department: 'Business', overall_gpa: 3.62, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.58 }, { academic_year: '2024/2025', gpa: 3.65 }],
  },
  {
    id: '13', display_name: 'Jasmine Clarke', student_id: '202100678',
    department: 'Medicine', overall_gpa: 3.59, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.55 }, { academic_year: '2024/2025', gpa: 3.62 }],
  },
  {
    id: '14', display_name: 'Ryan Gopaul', student_id: '202300512',
    department: 'Engineering', overall_gpa: 3.55, enrolment_year: 2024,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.55 }, { academic_year: '2024/2025', gpa: 3.48 }],
  },
  {
    id: '15', display_name: 'Serena Boodie', student_id: '202200103',
    department: 'Computer Science', overall_gpa: 3.52, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.48 }, { academic_year: '2024/2025', gpa: 3.55 }],
  },
  {
    id: '16', display_name: 'Andre Cummings', student_id: '202100789',
    department: 'Business', overall_gpa: 3.48, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.42 }, { academic_year: '2024/2025', gpa: 3.50 }],
  },
  {
    id: '17', display_name: 'Tisha Ramphal', student_id: '202300634',
    department: 'Natural Sciences', overall_gpa: 3.44, enrolment_year: 2025,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.44 }, { academic_year: '2024/2025', gpa: 0.00 }],
  },
  {
    id: '18', display_name: 'David Narine', student_id: '202200567',
    department: 'Medicine', overall_gpa: 3.41, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.38 }, { academic_year: '2024/2025', gpa: 3.44 }],
  },
  {
    id: '19', display_name: 'Keisha Fraser', student_id: '202100890',
    department: 'Engineering', overall_gpa: 3.37, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.30 }, { academic_year: '2024/2025', gpa: 3.40 }],
  },
  {
    id: '20', display_name: 'Miguel Sankar', student_id: '202300756',
    department: 'Computer Science', overall_gpa: 3.33, enrolment_year: 2025,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.33 }, { academic_year: '2024/2025', gpa: 0.00 }],
  },
  {
    id: '21', display_name: 'Alicia Deoraj', student_id: '202200678',
    department: 'Business', overall_gpa: 3.28, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.25 }, { academic_year: '2024/2025', gpa: 3.30 }],
  },
  {
    id: '22', display_name: 'Jerome Bacchus', student_id: '202100923',
    department: 'Natural Sciences', overall_gpa: 3.22, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.18 }, { academic_year: '2024/2025', gpa: 3.25 }],
  },
  {
    id: '23', display_name: 'Pooja Ramkhelawan', student_id: '202300867',
    department: 'Medicine', overall_gpa: 3.18, enrolment_year: 2024,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.18 }, { academic_year: '2024/2025', gpa: 3.10 }],
  },
  {
    id: '24', display_name: 'Chris Edghill', student_id: '202200789',
    department: 'Engineering', overall_gpa: 3.12, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.08 }, { academic_year: '2024/2025', gpa: 3.15 }],
  },
  {
    id: '25', display_name: 'Fatima Hussein', student_id: '202100012',
    department: 'Computer Science', overall_gpa: 3.05, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 3.00 }, { academic_year: '2024/2025', gpa: 3.08 }],
  },
  {
    id: '26', display_name: 'Brandon Kissoon', student_id: '202300978',
    department: 'Business', overall_gpa: 2.98, enrolment_year: 2025,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 2.98 }, { academic_year: '2024/2025', gpa: 0.00 }],
  },
  {
    id: '27', display_name: 'Indira Ramdeo', student_id: '202200890',
    department: 'Natural Sciences', overall_gpa: 2.90, enrolment_year: 2023,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 2.88 }, { academic_year: '2024/2025', gpa: 2.92 }],
  },
  {
    id: '28', display_name: 'Trevor Lall', student_id: '202100145',
    department: 'Medicine', overall_gpa: 2.82, enrolment_year: 2022,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 2.78 }, { academic_year: '2024/2025', gpa: 2.85 }],
  },
  {
    id: '29', display_name: 'Shanti Toolsie', student_id: '202400056',
    department: 'Engineering', overall_gpa: 2.65, enrolment_year: 2025,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 2.65 }, { academic_year: '2024/2025', gpa: 0.00 }],
  },
  {
    id: '30', display_name: 'Marcus Deen', student_id: '202300089',
    department: 'Computer Science', overall_gpa: 2.52, enrolment_year: 2024,
    gpa_per_year: [{ academic_year: '2025/2026', gpa: 2.50 }, { academic_year: '2024/2025', gpa: 2.55 }],
  },
]

const DEPT_STYLES: Record<string, string> = {
  'Computer Science': 'bg-blue-900/60 text-blue-300 border border-blue-700/40',
  'Engineering':      'bg-orange-900/60 text-orange-300 border border-orange-700/40',
  'Medicine':         'bg-pink-900/60 text-pink-300 border border-pink-700/40',
  'Natural Sciences': 'bg-green-900/60 text-green-300 border border-green-700/40',
  'Business':         'bg-purple-900/60 text-purple-300 border border-purple-700/40',
}

const RANK_STYLES = [
  { bg: '#d4af37', text: '#0a0a0a' },
  { bg: '#9ca3af', text: '#0a0a0a' },
  { bg: '#b45309', text: '#fff' },
]

const PAGE_SIZE = 25
const TABS = ['Global Overall', 'By Year Group', 'By Department', '2025/2026 GPA'] as const
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Medicine', 'Natural Sciences', 'Business']
const YEAR_GROUPS = [1, 2, 3, 4]

function getYearGroup(enrolment_year: number): number {
  return CURRENT_ACADEMIC_START - enrolment_year + 1
}

function getGpa(student: Student, mode: string): number {
  if (mode === 'overall') return student.overall_gpa
  const entry = student.gpa_per_year.find(y => y.academic_year === mode)
  return entry ? entry.gpa : 0
}

export default function LeaderBoard() {
  const [activeTab, setActiveTab] = useState<string>('Global Overall')
  const [gpaMode, setGpaMode] = useState<string>('overall')
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [deptFilter, setDeptFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = DUMMY_STUDENTS.filter(s => {
      if (yearFilter !== null && getYearGroup(s.enrolment_year) !== yearFilter) return false
      if (deptFilter !== null && s.department !== deptFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.display_name.toLowerCase().includes(q) && !s.student_id.includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => getGpa(b, gpaMode) - getGpa(a, gpaMode))
    return list
  }, [yearFilter, deptFilter, search, gpaMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startIndex = (safePage - 1) * PAGE_SIZE

  function resetPage() { setPage(1) }

  return (
    <section className="max-w-[1000px] mx-auto px-6 pb-12">

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-white/10 mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetPage() }}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
        <select
          value={yearFilter ?? ''}
          onChange={e => { setYearFilter(e.target.value ? Number(e.target.value) : null); resetPage() }}
          className="bg-[#111827] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
        >
          <option value="" className="bg-[#111827] text-white">All years</option>
          {YEAR_GROUPS.map(y => (
            <option key={y} value={y} className="bg-[#111827] text-white">Year {y}</option>
          ))}
        </select>

        {/* Department dropdown */}
        <select
          value={deptFilter ?? ''}
          onChange={e => { setDeptFilter(e.target.value || null); resetPage() }}
          className="bg-[#111827] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white/80 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]"
        >
          <option value="" className="bg-[#111827] text-white">All departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d} className="bg-[#111827] text-white">{d}</option>
          ))}
        </select>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" className="text-white/40 shrink-0">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.75"/>
            <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
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
      <div className="rounded-lg border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[48px_1fr_180px_90px_160px] px-4 py-2.5 border-b border-white/10">
          {['#', 'STUDENT', 'DEPARTMENT', 'YEAR', 'GPA'].map(h => (
            <span key={h} className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {pageItems.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-sm">No results found</div>
        ) : (
          pageItems.map((student, i) => {
            const rank = startIndex + i + 1
            const gpa = getGpa(student, gpaMode)
            const yearGroup = getYearGroup(student.enrolment_year)
            const isUser = student.is_current_user

            return (
              <div
                key={student.id}
                className={`grid grid-cols-[48px_1fr_180px_90px_160px] items-center px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                  isUser
                    ? 'border-l-2 border-l-[#d4af37] bg-[#d4af37]/5'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Rank */}
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

                {/* Student */}
                <div className="min-w-0 flex flex-col justify-center gap-px">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-sm font-medium text-white truncate">{student.display_name}</span>
                    {isUser && (
                      <span className="text-[9px] font-bold bg-[#d4af37] text-[#0a0a0a] px-1.5 py-0.5 rounded-sm tracking-widest shrink-0">YOU</span>
                    )}
                  </div>
                  <span className="text-[11px] text-white/40 font-mono leading-none">{student.student_id}</span>
                </div>

                {/* Department */}
                <div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DEPT_STYLES[student.department] ?? 'bg-white/10 text-white/60'}`}>
                    {student.department}
                  </span>
                </div>

                {/* Year */}
                <div>
                  <span className="text-sm font-mono text-white/60">Year {yearGroup}</span>
                </div>

                {/* GPA bar + value */}
                <div className="flex items-center gap-3">
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
              </div>
            )
          })
        )}
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
