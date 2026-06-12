import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getShowtimesByMovie, type ShowtimeDto } from '../../../api/showtimes'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
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

  useEffect(() => {
    if (!movieId) { setLoading(false); return }
    getShowtimesByMovie(movieId)
      .then(setShowtimes)
      .catch(() => setError('Không thể tải suất chiếu. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) return <p className="p-4 text-lg text-gray-500">Đang tải suất chiếu...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center gap-1">
        ← Quay lại
      </button>
      <h1 className="text-3xl font-bold mb-6">Chọn suất chiếu</h1>

      {showtimes.length === 0 && (
        <p className="text-gray-500">Chưa có suất chiếu cho phim này.</p>
      )}

      <div className="flex flex-col gap-3">
        {showtimes.map(s => (
          <button
            key={s.id}
            onClick={() => navigate(`/family-booking/packages?showtimeId=${s.id}`)}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div>
              <p className="font-semibold text-gray-900">{formatDateTime(s.startsAt)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.cinemaName} · {s.hallName}</p>
            </div>
            <span className="text-blue-600 font-bold">{formatPrice(Number(s.price))}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
