import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFamilyFriendlyMovies, type MovieDto } from '../../../api/familyBooking'
import { AgeRatingBadge } from '../components/AgeRatingBadge'

export function FamilyMovieListPage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getFamilyFriendlyMovies()
      .then(setMovies)
      .catch(() => setError('Không thể tải danh sách phim. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-4 text-lg text-gray-500">Đang tải phim...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Chọn phim cho gia đình</h1>
      {movies.length === 0 && (
        <p className="text-gray-500">Chưa có phim. Vui lòng thêm phim qua Admin API.</p>
      )}
      <div className="flex flex-col gap-4">
        {movies.map(m => (
          <button
            key={m.id}
            onClick={() => navigate(`/family-booking/showtimes?movieId=${m.id}`)}
            className="flex gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-blue-400 transition-colors"
          >
            <img
              src={m.posterUrl || 'https://placehold.co/80x112'}
              alt={m.title}
              className="w-20 h-28 rounded object-cover bg-gray-100 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AgeRatingBadge rating={m.ageRating} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{m.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{m.genre} · {m.duration} phút</p>
              <p className="text-yellow-500 text-sm mt-1">★ {m.rating}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
