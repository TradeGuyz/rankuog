import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiX } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface PendingVerification {
  id: string
  display_name: string
  student_id: string
  department: string
  enrolment_year: number
  verification_image_url: string
  created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function Admin() {
  const navigate = useNavigate()
  const { session, loading, profile } = useAuth()
  const [submissions, setSubmissions] = useState<PendingVerification[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [modalItem, setModalItem] = useState<PendingVerification | null>(null)
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!session || !profile?.is_admin) navigate('/', { replace: true })
  }, [loading, session, profile])

  useEffect(() => {
    if (!profile?.is_admin) return
    async function fetchPending() {
      const { data } = await supabase
        .from('users')
        .select('id, display_name, student_id, department, enrolment_year, verification_image_url, created_at')
        .not('verification_image_url', 'is', null)
        .eq('user_verified', false)
        .order('created_at', { ascending: true })
      setSubmissions((data ?? []) as PendingVerification[])
      setLoadingData(false)
    }
    fetchPending()
  }, [profile?.is_admin])

  if (loading || !session || !profile?.is_admin) return null

  async function handleApprove(id: string) {
    setActioning(id)
    await supabase.from('users').update({ user_verified: true }).eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (modalItem?.id === id) setModalItem(null)
    setActioning(null)
  }

  async function handleReject(id: string) {
    setActioning(id)
    await supabase.from('users').update({ verification_image_url: null }).eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
    if (modalItem?.id === id) setModalItem(null)
    setActioning(null)
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Admin</h1>
            <p className="text-sm text-white/40 mt-1">Verification Review</p>
          </div>
          {!loadingData && (
            <span className="bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full px-3 py-1 text-xs font-semibold">
              {submissions.length} pending
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {['STUDENT', 'STUDENT ID', 'DEPARTMENT', 'SUBMITTED', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-widest text-white/40 uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/30 text-sm">Loading...</td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/30 text-sm">No pending verifications</td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-white">{sub.display_name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono text-white/60">{sub.student_id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-white/60">{sub.department}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-sm text-white/40">{timeAgo(sub.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setModalItem(sub)}
                          className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          View ID
                        </button>
                        <button
                          onClick={() => handleApprove(sub.id)}
                          disabled={actioning === sub.id}
                          className="px-3 py-1 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 text-xs font-medium hover:bg-emerald-900/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(sub.id)}
                          disabled={actioning === sub.id}
                          className="px-3 py-1 rounded-md bg-red-900/40 text-red-400 border border-red-700/30 text-xs font-medium hover:bg-red-900/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Image modal */}
      {modalItem && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-base font-semibold text-white">{modalItem.display_name}</p>
                <p className="text-xs font-mono text-white/40 mt-0.5">{modalItem.student_id}</p>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* ID image */}
            <div className="rounded-lg overflow-hidden bg-white/5 border border-white/10 mb-4">
              <img
                src={modalItem.verification_image_url}
                alt="Student ID"
                className="w-full object-contain max-h-72"
              />
            </div>

            {/* Modal actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(modalItem.id)}
                disabled={actioning === modalItem.id}
                className="flex-1 py-2 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 text-sm font-medium hover:bg-emerald-900/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(modalItem.id)}
                disabled={actioning === modalItem.id}
                className="flex-1 py-2 rounded-lg bg-red-900/40 text-red-400 border border-red-700/30 text-sm font-medium hover:bg-red-900/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
