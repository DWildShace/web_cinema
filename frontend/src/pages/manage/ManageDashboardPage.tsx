import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats, type StatsDto } from '../../api/stats'

const STAT_CARDS = [
  { key: 'todayBookings' as const, label: 'Đặt vé hôm nay', icon: '🎟', color: 'text-green-400' },
  { key: 'totalBookings' as const, label: 'Tổng đặt vé', icon: '📊', color: 'text-blue-400' },
  { key: 'totalMovies' as const, label: 'Phim đang chiếu', icon: '🎬', color: 'text-purple-400' },
  { key: 'totalCustomers' as const, label: 'Khách hàng', icon: '👥', color: 'text-yellow-400' },
]

export function ManageDashboardPage() {
  const [stats, setStats] = useState<StatsDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">
          🎬
        </div>
        <div>
          <h1 className="font-bold text-zinc-100">Quản lý rạp chiếu</h1>
          <p className="text-xs text-zinc-500">Cinema Management Portal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {loading ? '—' : (stats?.[card.key] ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Quản lý</p>
        {[
          { to: '/manage/movies', icon: '🎬', label: 'Phim', desc: 'Thêm / sửa / xóa phim' },
          { to: '/manage/showtimes', icon: '🕐', label: 'Lịch chiếu', desc: 'Quản lý suất chiếu' },
          { to: '/manage/scan', icon: '📷', label: 'Soát vé', desc: 'Quét QR kiểm tra vé' },
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
