import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { isAuthenticated, email, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  return (
    <nav className="hidden md:flex sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-3 items-center justify-between">
      <Link to="/" className="text-lg font-bold tracking-tight text-zinc-100 hover:text-green-400 transition-colors">
        🎬 CinemaBooking
      </Link>

      <div className="flex items-center gap-6 text-sm text-zinc-400">
        <Link to="/search" className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          Tìm kiếm
        </Link>
        <Link to="/movies" className="hover:text-zinc-100 transition-colors">Phim</Link>
        <Link to="/family" className="hover:text-zinc-100 transition-colors">Gia đình</Link>
        {isAuthenticated ? (
          <>
            <Link to="/my-tickets" className="hover:text-zinc-100 transition-colors">Vé của tôi</Link>
            <span className="text-zinc-600 hidden lg:inline">{email}</span>
            <button
              onClick={() => { clearAuth(); navigate('/') }}
              className="text-zinc-400 hover:text-red-400 transition-colors"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-zinc-100 transition-colors">Đăng nhập</Link>
            <Link to="/register" className="px-4 py-1.5 rounded-full bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 transition-colors text-xs">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
