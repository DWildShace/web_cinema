import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function BottomNav() {
  const { isAuthenticated } = useAuthStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900/95 backdrop-blur border-t border-zinc-800 flex justify-around items-center h-16 px-2">
      <NavLink to="/" end className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs ${isActive ? 'text-green-400' : 'text-zinc-500'}`
      }>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11 2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Trang chủ</span>
      </NavLink>

      <NavLink to="/movies" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs ${isActive ? 'text-green-400' : 'text-zinc-500'}`
      }>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v12m-18 0V6.75m18 12.75a1.125 1.125 0 001.125-1.125M21.375 19.5h-1.5a1.125 1.125 0 01-1.125-1.125m0 0V6.75" />
        </svg>
        <span>Phim</span>
      </NavLink>

      {isAuthenticated ? (
        <NavLink to="/my-tickets" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs ${isActive ? 'text-green-400' : 'text-zinc-500'}`
        }>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
          </svg>
          <span>Vé của tôi</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs ${isActive ? 'text-green-400' : 'text-zinc-500'}`
        }>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span>Đăng nhập</span>
        </NavLink>
      )}

      <NavLink to="/profile" className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs ${isActive ? 'text-green-400' : 'text-zinc-500'}`
      }>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span>Tôi</span>
      </NavLink>
    </nav>
  )
}
