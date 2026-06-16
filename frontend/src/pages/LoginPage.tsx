import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await login({ email, password })
      setAuth(result.token, result.email, result.role)
      navigate('/')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401)
        setError(err.response.data?.error ?? 'Email hoặc mật khẩu không đúng.')
      else setError('Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20 md:pb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🎬</p>
          <h1 className="text-2xl font-bold text-zinc-100">Đăng nhập</h1>
          <p className="text-zinc-500 text-sm mt-1">Chào mừng trở lại</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Mật khẩu</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl bg-green-500 text-zinc-950 font-bold text-base disabled:opacity-40 active:scale-95 transition-all mt-2"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-green-400 font-semibold">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}
