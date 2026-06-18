import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getShowtimesByDate, type ShowtimeDto } from '../api/showtimes'

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildDateRange(days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    d.setHours(0, 0, 0, 0)
    return d
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function groupByMovie(showtimes: ShowtimeDto[]) {
  const map = new Map<number, { movieTitle: string; showtimes: ShowtimeDto[] }>()
  for (const s of showtimes) {
    if (!map.has(s.movieId)) map.set(s.movieId, { movieTitle: s.movieTitle, showtimes: [] })
    map.get(s.movieId)!.showtimes.push(s)
  }
  return [...map.values()]
}

export function SchedulePage() {
  const navigate = useNavigate()
  const dates = buildDateRange(7)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showtimes, setShowtimes] = useState<ShowtimeDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    setShowtimes([])
    getShowtimesByDate(toISODate(dates[selectedIdx]))
      .then(setShowtimes)
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx])

  const groups = groupByMovie(showtimes)

  return (
    <div className="pb-24 md:pb-6">
      {/* Header */}
      <div className="px-4 pt-4 mb-3">
        <h1 className="text-xl font-bold text-zinc-100">Lịch chiếu</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Chọn ngày để xem phim đang chiếu</p>
      </div>

      {/* Date chips */}
      <div className="flex gap-2 overflow-x-auto scroll-hide px-4 pb-1 mb-4">
        {dates.map((d, i) => {
          const isToday = i === 0
          const isActive = i === selectedIdx
          return (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl transition-all ${
                isActive
                  ? 'bg-green-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase">
                {isToday ? 'Hôm nay' : DAYS_VI[d.getDay()]}
              </span>
              <span className="text-xl font-bold leading-tight">{d.getDate()}</span>
              <span className="text-[10px]">{d.getMonth() + 1}/{d.getFullYear().toString().slice(2)}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="px-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-zinc-500">Không có suất chiếu nào trong ngày này.</p>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="flex flex-col gap-5">
            {groups.map(({ movieTitle, showtimes: movieShowtimes }) => (
              <div key={movieTitle}>
                {/* Movie name */}
                <button
                  onClick={() => navigate(`/movies/${movieShowtimes[0].movieId}`)}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <p className="font-bold text-zinc-100 text-base truncate pr-2">{movieTitle}</p>
                  <span className="text-zinc-600 text-sm flex-shrink-0">›</span>
                </button>

                {/* Time slot chips */}
                <div className="flex flex-wrap gap-2">
                  {movieShowtimes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/seat-picker?showtimeId=${s.id}`)}
                      className="flex flex-col items-start px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-green-500 active:scale-95 transition-all"
                    >
                      <span className="text-base font-bold text-zinc-100">{formatTime(s.startsAt)}</span>
                      <span className="text-[11px] text-zinc-500">{s.hallName}</span>
                      <span className="text-sm font-semibold text-green-400">
                        {Number(s.price).toLocaleString('vi-VN')}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
