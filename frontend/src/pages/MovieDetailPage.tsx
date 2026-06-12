import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovieById, type MovieDto } from '../api/movies'
import { getShowtimesByMovie, type ShowtimeDto } from '../api/showtimes'

const AGE_COLORS: Record<string, string> = {
  P:   'bg-green-100 text-green-800',
  K:   'bg-blue-100 text-blue-800',
  T13: 'bg-yellow-100 text-yellow-800',
  T16: 'bg-orange-100 text-orange-800',
  T18: 'bg-red-100 text-red-800',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + 'đ'
}

function groupByDate(showtimes: ShowtimeDto[]) {
  const map = new Map<string, ShowtimeDto[]>()
  for (const s of showtimes) {
    const key = new Date(s.startsAt).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return map
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)
  const navigate = useNavigate()

  const [movie, setMovie] = useState<MovieDto | null>(null)
  const [showtimes, setShowtimes] = useState<ShowtimeDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMovieById(movieId), getShowtimesByMovie(movieId)])
      .then(([m, st]) => { setMovie(m); setShowtimes(st) })
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) return <div className="flex justify-center p-12"><p className="text-gray-500">Đang tải...</p></div>
  if (!movie) return <p className="p-4 text-red-600 text-center">Không tìm thấy phim.</p>

  const grouped = groupByDate(showtimes)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 hover:underline">← Quay lại</button>

      <div className="flex gap-6 mb-8">
        <img
          src={movie.posterUrl || 'https://placehold.co/160x240'}
          alt={movie.title}
          className="w-32 sm:w-48 rounded-xl object-cover flex-shrink-0 shadow-md"
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${AGE_COLORS[movie.ageRating] ?? 'bg-gray-100'}`}>
              {movie.ageRating}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{movie.title}</h1>
          <p className="text-gray-500">{movie.genre} · {movie.duration} phút</p>
          <p className="text-yellow-500 font-medium">★ {movie.rating}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch chiếu</h2>

      {showtimes.length === 0 && (
        <p className="text-gray-500">Chưa có suất chiếu.</p>
      )}

      {[...grouped.entries()].map(([dateKey, list]) => (
        <div key={dateKey} className="mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {formatDate(list[0].startsAt)}
          </p>
          <div className="flex flex-wrap gap-3">
            {list.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/seat-picker?showtimeId=${s.id}`)}
                className="flex flex-col items-center px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <span className="text-lg font-bold text-gray-900">{formatTime(s.startsAt)}</span>
                <span className="text-xs text-gray-500 mt-0.5">{s.cinemaName}</span>
                <span className="text-xs text-gray-400">{s.hallName}</span>
                <span className="text-sm font-medium text-blue-600 mt-1">{formatPrice(s.price)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
