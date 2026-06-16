import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllMovies, type MovieDto } from '../api/movies'

const AGE_COLORS: Record<string, string> = {
  P:   'bg-green-500/20 text-green-400',
  K:   'bg-blue-500/20 text-blue-400',
  T13: 'bg-yellow-500/20 text-yellow-400',
  T16: 'bg-orange-500/20 text-orange-400',
  T18: 'bg-red-500/20 text-red-400',
}

export function SearchPage() {
  const [all, setAll] = useState<MovieDto[]>([])
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('Tất cả')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAllMovies()
      .then(setAll)
      .catch(() => {})
      .finally(() => setLoading(false))
    // auto-focus khi vào trang
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const filtered = all.filter(m => {
    const matchQuery = query.trim() === '' ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.genre.toLowerCase().includes(query.toLowerCase())
    const matchGenre = genre === 'Tất cả' || m.genre === genre
    return matchQuery && matchGenre
  })

  // Các genre thực sự có trong data
  const availableGenres = ['Tất cả', ...Array.from(new Set(all.map(m => m.genre)))]

  return (
    <div className="pb-24 md:pb-6">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm phim, thể loại..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-colors text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Genre chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto scroll-hide pb-0.5">
          {availableGenres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                genre === g
                  ? 'bg-green-500 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-40">
            <div className="w-7 h-7 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-zinc-500">Không tìm thấy phim nào</p>
            {query && <p className="text-zinc-600 text-sm mt-1">cho "{query}"</p>}
          </div>
        ) : (
          <>
            {query || genre !== 'Tất cả' ? (
              <p className="text-xs text-zinc-600 mb-3">{filtered.length} kết quả</p>
            ) : (
              <p className="text-sm font-semibold text-zinc-400 mb-3">Tất cả phim đang chiếu</p>
            )}

            <div className="flex flex-col gap-3">
              {filtered.map(m => (
                <Link
                  key={m.id}
                  to={`/movies/${m.id}`}
                  className="flex gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-3 active:scale-[0.98] transition-all"
                >
                  <div className="relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                    <img
                      src={m.posterUrl || 'https://placehold.co/80x112/27272a/4ade80?text=?'}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${AGE_COLORS[m.ageRating] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {m.ageRating}
                      </span>
                      <span className="text-[10px] text-yellow-400">★ {m.rating.toFixed(1)}</span>
                    </div>
                    <p className="font-bold text-zinc-100 text-sm leading-tight line-clamp-2">{m.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{m.genre} · {m.duration} phút</p>
                  </div>
                  <div className="flex items-center text-zinc-600 text-lg">›</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
