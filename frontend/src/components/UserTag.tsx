// Shown when the logged-in user has a verified GPA entry.
// Replace `isLoggedIn` and `currentUser` with real auth/data later.

const isLoggedIn = true

const currentUser = {
  display_name: 'Kevin Johnson',
  department: 'Computer Science',
  enrolment_year: 2023,
  overall_gpa: 3.72,
  current_year_gpa: 3.85,
  current_academic_year: '2025/2026',
  global_rank: 8,
  global_total: 142,
  year_group: 3,
  year_group_rank: 3,
  year_group_total: 38,
}

export default function UserTag() {
  if (!isLoggedIn) return null

  const { display_name, department, enrolment_year, overall_gpa, current_year_gpa,
    current_academic_year, global_rank, global_total, year_group,
    year_group_rank, year_group_total } = currentUser

  return (
    <section className="max-w-[1000px] mx-auto px-6 mb-5">
      <div className="border border-white/10 rounded-lg border-l-2 border-l-[#d4af37] bg-white/[0.03] px-6 py-4">

        {/* Name + identity — top left on small, hidden on large (shown in stats row instead) */}
        <div className="mb-4 lg:hidden">
          <p className="text-sm font-semibold text-white">{display_name}</p>
          <p className="text-xs text-white/40 mt-0.5 font-mono">
            {department} · Year {year_group} · {enrolment_year}          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-start gap-0 flex-wrap lg:flex-nowrap lg:items-center">

          {/* Global Rank */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Global Rank</p>
            <p className="text-xl font-bold text-[#d4af37] font-mono leading-none">#{global_rank}</p>
            <p className="text-xs text-white/40 mt-1">of {global_total} students</p>
          </div>

          {/* Year Group Rank */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Year {year_group} Rank</p>
            <p className="text-xl font-bold text-white font-mono leading-none">#{year_group_rank}</p>
            <p className="text-xs text-white/40 mt-1">of {year_group_total} Year {year_group}s</p>
          </div>

          {/* Overall GPA */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Overall GPA</p>
            <p className="text-xl font-bold text-white font-mono leading-none">{overall_gpa.toFixed(2)}</p>
            <p className="text-xs text-white/40 mt-1">4.0 scale</p>
          </div>

          {/* Current academic year GPA */}
          <div className="pr-6 lg:border-r lg:border-white/10 lg:mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">{current_academic_year} GPA</p>
            <p className="text-xl font-bold text-white font-mono leading-none">{current_year_gpa.toFixed(2)}</p>
            <p className="text-xs text-white/40 mt-1">this academic year</p>
          </div>

          {/* Name + identity — right end on large screens only */}
          <div className="hidden lg:block ml-auto text-right">
            <p className="text-sm font-semibold text-white">{display_name}</p>
            <p className="text-xs text-white/40 mt-0.5 font-mono">
              {department} · Year {year_group} · {enrolment_year}            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
