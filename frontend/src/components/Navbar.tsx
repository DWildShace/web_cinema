import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Navbar() {
  const { isAuthenticated, email, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
        🎬 CinemaBooking
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/movies" className="hover:text-blue-400 transition-colors">Phim</Link>
        {isAuthenticated ? (
          <>
            <Link to="/my-bookings" className="hover:text-blue-400 transition-colors">Vé của tôi</Link>
            <span className="text-gray-400 hidden sm:inline">{email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Đăng nhập</Link>
            <Link
              to="/register"
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
