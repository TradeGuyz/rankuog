const stats = [
  {
    label: 'PARTICIPANTS',
    value: '142',
    sub: 'across all departments',
  },
  {
    label: 'AVERAGE GPA',
    value: '3.24',
    sub: 'overall mean',
  },
  {
    label: 'TOP GPA',
    value: '3.98',
    sub: 'Priya Sharma · CS',
  },
  {
    label: 'DEPARTMENTS',
    value: '5',
    sub: 'competing this year',
  },
]

export default function States() {
  return (
    <section className="max-w-[1000px] mx-auto px-6 py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Leaderboard
        </h1>
        <p className="text-xs text-white/50 mt-0.5">
          University of Guyana · All Departments · All Years · March 2026
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
