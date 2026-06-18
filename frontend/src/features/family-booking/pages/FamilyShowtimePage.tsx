import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getShowtimesByMovie, type ShowtimeDto } from '../../../api/showtimes'

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function toDateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function groupByDate(showtimes: ShowtimeDto[]) {
  const map = new Map<string, ShowtimeDto[]>()
  for (const s of showtimes) {
    const key = toDateKey(s.startsAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return [...map.values()].map(list => ({
    date: new Date(list[0].startsAt),
    showtimes: list,
  }))
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + 'đ'
}

export function FamilyShowtimePage() {
  const [params] = useSearchParams()
  const movieId = Number(params.get('movieId')) || 0
  const navigate = useNavigate()

  const [showtimes, setShowtimes] = useState<ShowtimeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(0)

  useEffect(() => {
    if (!movieId) { setLoading(false); return }
    getShowtimesByMovie(movieId)
      .then(setShowtimes)
      .catch(() => setError('Không thể tải suất chiếu. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [movieId])

  const groups = groupByDate(showtimes)
  const currentGroup = groups[selectedDate]

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="p-6 text-red-400 text-center">{error}</p>

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">←</button>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Chọn suất chiếu</h1>
          <p className="text-xs text-zinc-500">Gói gia đình · giảm giá đến 20%</p>
        </div>
      </div>

      {showtimes.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">Chưa có suất chiếu cho phim này.</p>
      ) : (
        <>
          {/* Date chip selector */}
          <div className="flex gap-2 overflow-x-auto scroll-hide pb-1 mb-4">
            {groups.map((g, i) => {
              const isActive = i === selectedDate
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl transition-all ${
                    isActive ? 'bg-green-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase">{DAYS_VI[g.date.getDay()]}</span>
                  <span className="text-xl font-bold leading-tight">{g.date.getDate()}</span>
                  <span className="text-[10px]">{g.date.getMonth() + 1}/{g.date.getFullYear().toString().slice(2)}</span>
                </button>
              )
            })}
          </div>

          {/* Time slots for selected date */}
          {currentGroup && (
            <div className="flex flex-col gap-2">
              {currentGroup.showtimes.map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/family/packages?showtimeId=${s.id}`)}
                  className="flex items-center justify-between rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3.5 text-left active:scale-[0.98] transition-all"
                >
                  <div>
                    <p className="font-bold text-zinc-100 text-base">{formatTime(s.startsAt)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.cinemaName} · {s.hallName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-semibold text-sm">{formatPrice(Number(s.price))}</span>
                    <span className="text-zinc-600">›</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
