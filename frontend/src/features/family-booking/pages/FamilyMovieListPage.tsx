import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFamilyFriendlyMovies, type MovieDto } from '../../../api/familyBooking'

function AgeRating({ rating }: { rating: string }) {
  const map: Record<string, string> = { P: 'bg-green-500/20 text-green-400 border-green-700', K: 'bg-green-500/20 text-green-400 border-green-700', T13: 'bg-yellow-500/20 text-yellow-400 border-yellow-700', T16: 'bg-orange-500/20 text-orange-400 border-orange-700', T18: 'bg-red-500/20 text-red-400 border-red-700' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${map[rating] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{rating}</span>
}

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
          <h1 className="text-lg font-bold text-zinc-100">Chọn phim</h1>
          <p className="text-xs text-zinc-500">Phim phù hợp cho cả gia đình</p>
        </div>
      </div>

      {movies.length === 0 && (
        <p className="text-zinc-500 text-center py-8">Chưa có phim gia đình. Vui lòng thêm qua Admin.</p>
      )}

      <div className="flex flex-col gap-3">
        {movies.map(m => (
          <button
            key={m.id}
            onClick={() => navigate(`/family/showtimes?movieId=${m.id}`)}
            className="flex gap-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-left active:scale-[0.98] transition-all"
          >
            <img
              src={m.posterUrl || 'https://placehold.co/80x112/18181b/52525b?text=🎬'}
              alt={m.title}
              className="w-16 h-24 rounded-xl object-cover bg-zinc-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 py-0.5">
              <div className="flex items-center gap-2 mb-1.5">
                <AgeRating rating={m.ageRating} />
                <span className="text-[10px] text-yellow-400">★ {m.rating}</span>
              </div>
              <h2 className="font-bold text-zinc-100 leading-tight">{m.title}</h2>
              <p className="text-xs text-zinc-500 mt-1">{m.genre} · {m.duration} phút</p>
            </div>
            <div className="flex items-center text-zinc-600">›</div>
          </button>
        ))}
      </div>
    </div>
  )
}
