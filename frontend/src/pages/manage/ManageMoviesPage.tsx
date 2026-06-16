import { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllMovies, createMovie, deleteMovie, type MovieDto, type CreateMovieDto } from '../../api/movies'

const EMPTY_FORM: CreateMovieDto = {
  title: '', genre: '', duration: 120, posterUrl: '', rating: 7.0, ageRating: 'P',
}

const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C']

export function ManageMoviesPage() {
  const [movies, setMovies] = useState<MovieDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateMovieDto>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMovies = () => {
    setLoading(true)
    getAllMovies().then(setMovies).finally(() => setLoading(false))
  }

  useEffect(loadMovies, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createMovie({ ...form, duration: Number(form.duration), rating: Number(form.rating) })
      setForm(EMPTY_FORM)
      setShowForm(false)
      loadMovies()
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Lỗi khi lưu phim.') : 'Lỗi khi lưu phim.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Xóa phim "${title}"?`)) return
    try {
      await deleteMovie(id)
      loadMovies()
    } catch {
      alert('Không thể xóa phim này.')
    }
  }

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-zinc-100 text-lg">Quản lý phim</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm"
        >
          {showForm ? 'Huỷ' : '+ Thêm phim'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-6 flex flex-col gap-3">
          <p className="font-semibold text-zinc-100 text-sm mb-1">Thêm phim mới</p>
          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>
          )}
          {([
            { key: 'title', label: 'Tên phim', type: 'text', required: true },
            { key: 'genre', label: 'Thể loại', type: 'text', required: true },
            { key: 'posterUrl', label: 'URL poster', type: 'url', required: false },
          ] as const).map(f => (
            <div key={f.key}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Thời lượng (phút)</label>
              <input
                type="number" required min={1} value={form.duration}
                onChange={e => setForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Điểm đánh giá</label>
              <input
                type="number" required min={0} max={10} step={0.1} value={form.rating}
                onChange={e => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Giới hạn tuổi</label>
              <select
                value={form.ageRating}
                onChange={e => setForm(prev => ({ ...prev, ageRating: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-green-500 transition-colors"
              >
                {AGE_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit" disabled={saving}
            className="py-3 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm disabled:opacity-40"
          >
            {saving ? 'Đang lưu...' : 'Lưu phim'}
          </button>
        </form>
      )}

      {/* Movie list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {movies.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              {m.posterUrl ? (
                <img src={m.posterUrl} alt={m.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-zinc-800" />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-100 text-sm truncate">{m.title}</p>
                <p className="text-xs text-zinc-500">{m.genre} · {m.duration}p · ★{m.rating.toFixed(1)}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 mt-1 inline-block">{m.ageRating}</span>
              </div>
              <button
                onClick={() => handleDelete(m.id, m.title)}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors flex-shrink-0"
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
