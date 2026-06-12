import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllMovies, type MovieDto } from '../api/movies'

const AGE_COLORS: Record<string, string> = {
  P:   'bg-green-100 text-green-800',
  K:   'bg-blue-100 text-blue-800',
  T13: 'bg-yellow-100 text-yellow-800',
  T16: 'bg-orange-100 text-orange-800',
  T18: 'bg-red-100 text-red-800',
}

export function MovieListPage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllMovies()
      .then(setMovies)
      .catch(() => setError('Không thể tải danh sách phim. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <p className="text-gray-500 text-lg">Đang tải phim...</p>
    </div>
  )
  if (error) return <p className="p-4 text-red-600 text-center">{error}</p>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Đang chiếu</h1>

      {movies.length === 0 && (
        <p className="text-gray-500 text-center py-12">Chưa có phim nào.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {movies.map(m => (
          <Link
            key={m.id}
            to={`/movies/${m.id}`}
            className="group flex flex-col rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="relative aspect-[2/3] bg-gray-100">
              <img
                src={m.posterUrl || 'https://placehold.co/300x450?text=No+Image'}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${AGE_COLORS[m.ageRating] ?? 'bg-gray-100 text-gray-700'}`}>
                {m.ageRating}
              </span>
            </div>
            <div className="p-2">
              <h2 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{m.title}</h2>
              <p className="text-xs text-gray-500 mt-1">{m.genre} · {m.duration} phút</p>
              <p className="text-xs text-yellow-500 mt-0.5">★ {m.rating}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
