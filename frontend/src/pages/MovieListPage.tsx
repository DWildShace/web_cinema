import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllMovies, type MovieDto } from '../api/movies'

const AGE_COLORS: Record<string, string> = {
  P:   'bg-green-500/20 text-green-400',
  K:   'bg-blue-500/20 text-blue-400',
  T13: 'bg-yellow-500/20 text-yellow-400',
  T16: 'bg-orange-500/20 text-orange-400',
  T18: 'bg-red-500/20 text-red-400',
}

export function MovieListPage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllMovies()
      .then(setMovies)
      .catch(() => setError('Không thể tải danh sách phim.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="p-6 text-red-400 text-center">{error}</p>

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Đang chiếu</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movies.map(m => (
          <Link
            key={m.id}
            to={`/movies/${m.id}`}
            className="group"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[2/3] bg-zinc-800">
              <img
                src={m.posterUrl || 'https://placehold.co/300x450/27272a/4ade80?text=?'}
                alt={m.title}
                className="w-full h-full object-cover group-active:scale-95 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${AGE_COLORS[m.ageRating] ?? 'bg-zinc-700 text-zinc-300'}`}>
                {m.ageRating}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{m.title}</p>
                <p className="text-yellow-400 text-[10px] mt-0.5">★ {m.rating} · {m.duration}p</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {movies.length === 0 && (
        <p className="text-zinc-500 text-center py-16">Chưa có phim nào.</p>
      )}
    </div>
  )
}
