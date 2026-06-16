import { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllShowtimes, createShowtime, deleteShowtime, type ShowtimeDto } from '../../api/showtimes'
import { getAllMovies, type MovieDto } from '../../api/movies'
import { getAllHalls, type HallDto } from '../../api/halls'

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r)

function formatDT(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

export function ManageShowtimesPage() {
  const [showtimes, setShowtimes] = useState<ShowtimeDto[]>([])
  const [movies, setMovies] = useState<MovieDto[]>([])
  const [halls, setHalls] = useState<HallDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [movieId, setMovieId] = useState('')
  const [hallId, setHallId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [price, setPrice] = useState('75000')

  const load = () => {
    setLoading(true)
    Promise.all([getAllShowtimes(), getAllMovies(), getAllHalls()])
      .then(([s, m, h]) => { setShowtimes(s); setMovies(m); setHalls(h) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createShowtime({
        movieId: Number(movieId),
        hallId: Number(hallId),
        startsAt: new Date(startsAt).toISOString(),
        price: Number(price),
      })
      setShowForm(false)
      setMovieId(''); setHallId(''); setStartsAt(''); setPrice('75000')
      load()
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Lỗi khi tạo suất chiếu.') : 'Lỗi khi tạo suất chiếu.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa suất chiếu này?')) return
    try { await deleteShowtime(id); load() }
    catch { alert('Không thể xóa suất chiếu này.') }
  }

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-zinc-100 text-lg">Lịch chiếu</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm"
        >
          {showForm ? 'Huỷ' : '+ Thêm suất'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-6 flex flex-col gap-3">
          <p className="font-semibold text-zinc-100 text-sm">Tạo suất chiếu mới</p>
          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>
          )}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Phim</label>
            <select
              required value={movieId} onChange={e => setMovieId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">-- Chọn phim --</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Phòng chiếu</label>
            <select
              required value={hallId} onChange={e => setHallId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value="">-- Chọn phòng --</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>
                  {h.cinemaName} – {h.name} ({h.rows}×{h.columns})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Giờ chiếu</label>
              <input
                type="datetime-local" required value={startsAt} onChange={e => setStartsAt(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Giá vé (VNĐ)</label>
              <input
                type="number" required min={1000} value={price} onChange={e => setPrice(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>
          <button
            type="submit" disabled={saving}
            className="py-3 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm disabled:opacity-40"
          >
            {saving ? 'Đang tạo...' : 'Tạo suất chiếu'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {showtimes.length === 0 && <p className="text-zinc-500 text-center py-8">Chưa có suất chiếu nào.</p>}
          {showtimes.map(s => (
            <div key={s.id} className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-100 text-sm truncate">{s.movieTitle}</p>
                <p className="text-xs text-zinc-500">{s.cinemaName} · {s.hallName}</p>
                <p className="text-xs text-green-400 mt-0.5">{formatDT(s.startsAt)} · {s.price.toLocaleString()}đ</p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors flex-shrink-0 text-xs"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
