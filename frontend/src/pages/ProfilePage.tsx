import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getProfile, changePassword, type UserProfileDto } from '../api/users'
import { useAuthStore } from '../store/authStore'

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    Admin: 'bg-red-500/20 text-red-400 border-red-800',
    Customer: 'bg-green-500/20 text-green-400 border-green-800',
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${map[role] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {role === 'Admin' ? '👑 Quản trị' : '🎬 Thành viên'}
    </span>
  )
}

export function ProfilePage() {
  const { isAuthenticated, email: storedEmail, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfileDto | null>(null)
  const [loading, setLoading] = useState(true)

  // change password form
  const [showPwForm, setShowPwForm] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('Mật khẩu xác nhận không khớp.'); return }
    if (newPw.length < 6) { setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return }
    setPwLoading(true)
    try {
      await changePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => { setShowPwForm(false); setPwSuccess(false) }, 2000)
    } catch (err) {
      if (axios.isAxiosError(err))
        setPwError(err.response?.data?.error ?? 'Đổi mật khẩu thất bại.')
      else setPwError('Đổi mật khẩu thất bại.')
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) return null

  const displayEmail = profile?.email ?? storedEmail ?? ''
  const role = profile?.role ?? 'Customer'

  return (
    <div className="px-4 pt-6 pb-24 md:pb-6 max-w-lg mx-auto">
      {/* Avatar + info */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl">
          👤
        </div>
        <div className="text-center">
          <p className="font-bold text-zinc-100 text-lg">{displayEmail}</p>
          <div className="mt-2">
            <RoleBadge role={role} />
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-2 mb-6">
        <Link
          to="/my-tickets"
          className="flex items-center justify-between rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg">🎟</div>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">Vé của tôi</p>
              <p className="text-xs text-zinc-500">Lịch sử đặt vé</p>
            </div>
          </div>
          <span className="text-zinc-600 text-lg">›</span>
        </Link>

        <button
          onClick={() => { setShowPwForm(v => !v); setPwError(null); setPwSuccess(false) }}
          className="flex items-center justify-between rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4 w-full text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg">🔒</div>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">Đổi mật khẩu</p>
              <p className="text-xs text-zinc-500">Cập nhật mật khẩu đăng nhập</p>
            </div>
          </div>
          <span className={`text-zinc-600 text-lg transition-transform ${showPwForm ? 'rotate-90' : ''}`}>›</span>
        </button>

        {/* Change password form */}
        {showPwForm && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-4">
            {pwSuccess ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-green-400 font-semibold">Đổi mật khẩu thành công!</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                {pwError && (
                  <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {pwError}
                  </div>
                )}
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Mật khẩu hiện tại</label>
                  <input
                    type="password" required value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Mật khẩu mới</label>
                  <input
                    type="password" required minLength={6} value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">Xác nhận mật khẩu mới</label>
                  <input
                    type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setShowPwForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm font-semibold"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit" disabled={pwLoading}
                    className="flex-1 py-2.5 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm disabled:opacity-40"
                  >
                    {pwLoading ? '...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl bg-zinc-900 border border-red-900/50 text-red-400 font-semibold text-sm active:scale-95 transition-all"
      >
        Đăng xuất
      </button>

      <p className="text-center text-[11px] text-zinc-700 mt-6">
        CinemaBooking · {profile?.id ? `ID #${profile.id}` : ''}
      </p>
    </div>
  )
}
