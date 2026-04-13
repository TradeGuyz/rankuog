import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface RankStats {
  globalRank: number
  globalTotal: number
  yearGroupRank: number
  yearGroupTotal: number
  currentYearGpa: number | null
  currentAcademicYear: string
}

function getAcademicYearStart(): number {
  const now = new Date()
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
}

export default function UserTag() {
  const { session, profile } = useAuth()
  const [stats, setStats] = useState<RankStats | null>(null)

  useEffect(() => {
    if (!profile || profile.overall_gpa == null) return

    async function fetchStats() {
      const yearStart = getAcademicYearStart()
      const academicYear = `${yearStart}/${yearStart + 1}`

      const [globalRankRes, globalTotalRes, yearRankRes, yearTotalRes, currentYearRes] = await Promise.all([
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gt('overall_gpa', profile!.overall_gpa!)
          .eq('email_verified', true),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('overall_gpa', 'is', null)
          .eq('email_verified', true),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gt('overall_gpa', profile!.overall_gpa!)
          .eq('email_verified', true)
          .eq('enrolment_year', profile!.enrolment_year),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('overall_gpa', 'is', null)
          .eq('email_verified', true)
          .eq('enrolment_year', profile!.enrolment_year),
        supabase
          .from('gpa_per_year')
          .select('gpa')
          .eq('user_id', profile!.id)
          .eq('academic_year', academicYear)
          .maybeSingle(),
      ])

      setStats({
        globalRank: (globalRankRes.count ?? 0) + 1,
        globalTotal: globalTotalRes.count ?? 0,
        yearGroupRank: (yearRankRes.count ?? 0) + 1,
        yearGroupTotal: yearTotalRes.count ?? 0,
        currentYearGpa: currentYearRes.data?.gpa ?? null,
        currentAcademicYear: academicYear,
      })
    }

    fetchStats()
  }, [profile])

  if (!session || !profile) return null

  const yearStart = getAcademicYearStart()
  const yearGroup = yearStart - profile.enrolment_year + 1

  const globalRank = stats ? `#${stats.globalRank}` : '—'
  const globalTotal = stats ? stats.globalTotal : '—'
  const yearGroupRank = stats ? `#${stats.yearGroupRank}` : '—'
  const yearGroupTotal = stats ? stats.yearGroupTotal : '—'
  const overallGpa = profile.overall_gpa != null ? profile.overall_gpa.toFixed(2) : '—'
  const currentYearGpa = stats?.currentYearGpa != null ? stats.currentYearGpa.toFixed(2) : '—'
  const academicYear = stats?.currentAcademicYear ?? `${yearStart}/${yearStart + 1}`

  return (
    <section className="max-w-[1000px] mx-auto px-6 mb-5">
      <div className="border border-white/10 rounded-lg border-l-2 border-l-[#d4af37] bg-white/[0.03] px-6 py-4">

        {/* Name + identity — top left on small, hidden on large (shown in stats row instead) */}
        <div className="mb-4 lg:hidden">
          <p className="text-sm font-semibold text-white">{profile.display_name}</p>
          <p className="text-xs text-white/40 mt-0.5 font-mono">
            {profile.department} · Year {yearGroup} · {profile.enrolment_year}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-start gap-0 flex-wrap lg:flex-nowrap lg:items-center">

          {/* Global Rank */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Global Rank</p>
            <p className="text-xl font-bold text-[#d4af37] font-mono leading-none">{globalRank}</p>
            <p className="text-xs text-white/40 mt-1">of {globalTotal} students</p>
          </div>

          {/* Year Group Rank */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Year {yearGroup} Rank</p>
            <p className="text-xl font-bold text-white font-mono leading-none">{yearGroupRank}</p>
            <p className="text-xs text-white/40 mt-1">of {yearGroupTotal} Year {yearGroup}s</p>
          </div>

          {/* Overall GPA */}
          <div className="pr-6 border-r border-white/10 mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">Overall GPA</p>
            <p className="text-xl font-bold text-white font-mono leading-none">{overallGpa}</p>
            <p className="text-xs text-white/40 mt-1">4.0 scale</p>
          </div>

          {/* Current academic year GPA */}
          <div className="pr-6 lg:border-r lg:border-white/10 lg:mr-6">
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">{academicYear} GPA</p>
            <p className="text-xl font-bold text-white font-mono leading-none">{currentYearGpa}</p>
            <p className="text-xs text-white/40 mt-1">this academic year</p>
          </div>

          {/* Name + identity — right end on large screens only */}
          <div className="hidden lg:block ml-auto text-right">
            <p className="text-sm font-semibold text-white">{profile.display_name}</p>
            <p className="text-xs text-white/40 mt-0.5 font-mono">
              {profile.department} · Year {yearGroup} · {profile.enrolment_year}
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
