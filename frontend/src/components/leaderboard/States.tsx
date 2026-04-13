import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface StatsData {
  participants: number
  averageGpa: number
  topGpa: number
  topName: string
  topDepartment: string
  departments: number
}

function getSubtitleDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function States() {
  const [data, setData] = useState<StatsData | null>(null)

  useEffect(() => {
    async function fetchStats() {
      const baseQuery = supabase
        .from('users')
        .select('overall_gpa, display_name, department, is_anonymous')
        .eq('email_verified', true)
        .not('overall_gpa', 'is', null)

      const [allRes, topRes] = await Promise.all([
        baseQuery,
        supabase
          .from('users')
          .select('overall_gpa, display_name, department, is_anonymous')
          .eq('email_verified', true)
          .not('overall_gpa', 'is', null)
          .order('overall_gpa', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (allRes.error || !allRes.data) return

      const rows = allRes.data
      const participants = rows.length
      const averageGpa = rows.reduce((sum, r) => sum + Number(r.overall_gpa), 0) / participants
      const departments = new Set(rows.map((r) => r.department)).size

      const top = topRes.data
      setData({
        participants,
        averageGpa,
        topGpa: top ? Number(top.overall_gpa) : 0,
        topName: top ? (top.is_anonymous ? 'Anonymous' : top.display_name) : '—',
        topDepartment: top ? top.department : '—',
        departments,
      })
    }

    fetchStats()
  }, [])

  const participants = data ? String(data.participants) : '—'
  const averageGpa = data ? data.averageGpa.toFixed(2) : '—'
  const topGpa = data ? data.topGpa.toFixed(2) : '—'
  const topSub = data ? `${data.topName} · ${data.topDepartment}` : '—'
  const departments = data ? String(data.departments) : '—'

  const stats = [
    { label: 'PARTICIPANTS', value: participants, sub: 'across all departments' },
    { label: 'AVERAGE GPA',  value: averageGpa,   sub: 'overall mean' },
    { label: 'TOP GPA',      value: topGpa,        sub: topSub },
    { label: 'DEPARTMENTS',  value: departments,   sub: 'competing this year' },
  ]

  return (
    <section className="max-w-[1000px] mx-auto px-6 py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Leaderboard
        </h1>
        <p className="text-xs text-white/50 mt-0.5">
          University of Guyana · All Departments · All Years · {getSubtitleDate()}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
          >
            <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-light text-white tracking-tight font-mono leading-none">
              {stat.value}
            </p>
            <p className="text-xs text-white/40 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
