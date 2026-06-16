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

export function HomePage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  useEffect(() => { getAllMovies().then(setMovies).catch(() => {}) }, [])

  const hero = movies[0]

  return (
    <div className="pb-20 md:pb-0">
      {/* ── Hero ── */}
      <div className="relative h-[55vw] max-h-80 md:max-h-96 overflow-hidden">
        {hero && (
          <img
            src={hero.posterUrl || 'https://placehold.co/800x400/18181b/4ade80?text=Cinema'}
            alt={hero.title}
            className="w-full h-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        <div className="absolute bottom-4 left-4 right-4">
          {hero && (
            <>
              <h1 className="text-2xl font-bold text-white drop-shadow">{hero.title}</h1>
              <p className="text-zinc-300 text-sm mt-0.5">{hero.genre} · {hero.duration} phút</p>
            </>
          )}
        </div>
      </div>

      {/* ── 2 lối vào ── */}
      <div className="px-4 mt-3 flex gap-3 mb-6">
        <Link
          to={hero ? `/movies/${hero.id}` : '/movies'}
          className="flex-1 py-3.5 rounded-2xl bg-green-500 text-zinc-950 font-bold text-center text-sm active:scale-95 transition-transform"
        >
          🎟 Đặt vé ngay
        </Link>
        <Link
          to="/family"
          className="flex-1 py-3.5 rounded-2xl bg-zinc-800 text-zinc-100 font-bold text-center text-sm active:scale-95 transition-transform border border-zinc-700"
        >
          👨‍👩‍👧 Gói gia đình
        </Link>
      </div>

      {/* ── Đang chiếu ── */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-zinc-100">Đang chiếu</h2>
          <Link to="/movies" className="text-green-400 text-sm">Xem tất cả</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-hide pb-1">
          {movies.map(m => (
            <Link
              key={m.id}
              to={`/movies/${m.id}`}
              className="flex-shrink-0 w-28 group"
            >
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-zinc-800">
                <img
                  src={m.posterUrl || 'https://placehold.co/200x300/27272a/4ade80?text=?'}
                  alt={m.title}
                  className="w-full h-full object-cover group-active:scale-95 transition-transform"
                />
                <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${AGE_COLORS[m.ageRating] ?? 'bg-zinc-700 text-zinc-300'}`}>
                  {m.ageRating}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-300 font-medium line-clamp-2 leading-tight">{m.title}</p>
              <p className="text-[10px] text-yellow-400 mt-0.5">★ {m.rating.toFixed(1)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Gia đình banner ── */}
      <section className="mx-4 mb-6 rounded-2xl bg-gradient-to-r from-green-950 to-zinc-900 border border-green-900/50 p-4 flex items-center justify-between">
        <div>
          <p className="text-green-400 font-bold text-base">Gói gia đình</p>
          <p className="text-zinc-400 text-xs mt-1">Ghế liền nhau tự động · Giảm đến 20%</p>
        </div>
        <Link
          to="/family"
          className="px-4 py-2 rounded-full bg-green-500 text-zinc-950 font-bold text-sm whitespace-nowrap"
        >
          Xem gói
        </Link>
      </section>
    </div>
  )
}
