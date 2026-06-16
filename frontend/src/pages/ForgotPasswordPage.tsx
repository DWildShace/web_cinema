import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pb-24 md:pb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl mx-auto mb-4">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Quên mật khẩu</h1>
          <p className="text-zinc-500 text-sm mt-2">
            {submitted
              ? 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
              : 'Nhập email và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.'}
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-green-400 font-semibold text-sm">Email đã được gửi!</p>
              <p className="text-zinc-500 text-xs mt-1">Kiểm tra hộp thư của bạn (kể cả thư rác).</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
              <p className="text-yellow-400 text-xs font-medium">Tính năng đang phát triển</p>
              <p className="text-zinc-500 text-xs mt-1">Liên hệ quản trị viên để được hỗ trợ đặt lại mật khẩu.</p>
            </div>
            <Link
              to="/login"
              className="block py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-center text-sm mt-2"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ten@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="py-3.5 rounded-2xl bg-green-500 text-zinc-950 font-bold text-sm"
            >
              Gửi liên kết đặt lại
            </button>
            <Link
              to="/login"
              className="block py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold text-center text-sm"
            >
              ← Quay lại đăng nhập
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
