import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovieById, type MovieDto } from '../api/movies'
import { getShowtimesByMovie, type ShowtimeDto } from '../api/showtimes'

const AGE_COLORS: Record<string, string> = {
  P:   'bg-green-500/20 text-green-400 border-green-800',
  K:   'bg-blue-500/20 text-blue-400 border-blue-800',
  T13: 'bg-yellow-500/20 text-yellow-400 border-yellow-800',
  T16: 'bg-orange-500/20 text-orange-400 border-orange-800',
  T18: 'bg-red-500/20 text-red-400 border-red-800',
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function groupByDate(showtimes: ShowtimeDto[]) {
  const map = new Map<string, ShowtimeDto[]>()
  for (const s of showtimes) {
    const d = new Date(s.startsAt)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return [...map.entries()].map(([, list]) => ({
    date: new Date(list[0].startsAt),
    showtimes: list
  }))
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(p: number) {
  return (p / 1000).toFixed(0) + 'k'
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)
  const navigate = useNavigate()

  const [movie, setMovie] = useState<MovieDto | null>(null)
  const [showtimes, setShowtimes] = useState<ShowtimeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(0)

  useEffect(() => {
    Promise.all([getMovieById(movieId), getShowtimesByMovie(movieId)])
      .then(([m, st]) => { setMovie(m); setShowtimes(st) })
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!movie) return <p className="p-6 text-red-400 text-center">Không tìm thấy phim.</p>

  const groups = groupByDate(showtimes)
  const currentGroup = groups[selectedDate]

  return (
    <div className="pb-24 md:pb-6">
      {/* ── Poster hero ── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={movie.posterUrl || 'https://placehold.co/800x400/18181b/4ade80?text=No+Poster'}
          alt={movie.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-zinc-950" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-sm"
        >
          ←
        </button>
      </div>

      {/* ── Info ── */}
      <div className="px-4 -mt-6 relative">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-100 leading-tight">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {movie.genre.split('/').map(g => (
                <span key={g} className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">{g.trim()}</span>
              ))}
              <span className={`text-xs px-3 py-1 rounded-full border ${AGE_COLORS[movie.ageRating] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                {movie.ageRating}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-zinc-400">
              <span>⏱ {movie.duration} phút</span>
              <span className="text-yellow-400">★ {movie.rating}</span>
            </div>
          </div>
        </div>

        {/* ── Date picker ── */}
        {groups.length > 0 && (
          <>
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

            {/* ── Time slots ── */}
            {currentGroup && (
              <div className="flex gap-3 flex-wrap">
                {currentGroup.showtimes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/seat-picker?showtimeId=${s.id}`)}
                    className="flex flex-col items-center px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 hover:border-green-500 active:scale-95 transition-all"
                  >
                    <span className="text-lg font-bold text-zinc-100">{formatTime(s.startsAt)}</span>
                    <span className="text-xs text-zinc-500 mt-0.5">{s.hallName}</span>
                    <span className="text-sm font-semibold text-green-400 mt-1">{formatPrice(Number(s.price))}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {groups.length === 0 && (
          <div className="rounded-2xl bg-zinc-800/50 border border-zinc-700 p-6 text-center mt-4">
            <p className="text-zinc-500">Chưa có suất chiếu.</p>
          </div>
        )}
      </div>
    </div>
  )
}
