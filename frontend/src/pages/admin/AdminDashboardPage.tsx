import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function AdminDashboardPage() {
  const { email } = useAuthStore()

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xl">
          👑
        </div>
        <div>
          <h1 className="font-bold text-zinc-100">System Admin</h1>
          <p className="text-xs text-zinc-500">{email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Quản trị hệ thống</p>
        {[
          { to: '/admin/users', icon: '👥', label: 'Người dùng', desc: 'Xem danh sách & thay đổi role' },
          { to: '/admin/cinemas', icon: '🏛', label: 'Rạp chiếu', desc: 'Thêm & quản lý rạp' },
          { to: '/manage', icon: '🎬', label: 'Quản lý rạp (portal)', desc: 'Dashboard CinemaManager' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-100 text-sm">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>
            <span className="text-zinc-600">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
