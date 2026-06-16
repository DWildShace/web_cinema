import { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCinemas, createCinema, type CinemaDto } from '../../api/cinemas'

export function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<CinemaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getAllCinemas().then(setCinemas).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await createCinema(name, location)
      setName(''); setLocation(''); setShowForm(false)
      load()
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Lỗi khi tạo rạp.') : 'Lỗi khi tạo rạp.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-zinc-100 text-lg">Quản lý rạp chiếu</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm"
        >
          {showForm ? 'Huỷ' : '+ Thêm rạp'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-6 flex flex-col gap-3">
          <p className="font-semibold text-zinc-100 text-sm">Thêm rạp mới</p>
          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>
          )}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Tên rạp</label>
            <input
              required value={name} onChange={e => setName(e.target.value)}
              placeholder="CGV Vincom..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Địa điểm</label>
            <input
              required value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Quận 1, TP.HCM"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <button
            type="submit" disabled={saving}
            className="py-3 rounded-xl bg-green-500 text-zinc-950 font-bold text-sm disabled:opacity-40"
          >
            {saving ? 'Đang lưu...' : 'Tạo rạp'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cinemas.map(c => (
            <div key={c.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-zinc-100">{c.name}</p>
                  <p className="text-zinc-500 text-sm">{c.location}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex-shrink-0">
                  {c.hallCount} phòng
                </span>
              </div>
              {c.halls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {c.halls.map(h => (
                    <span key={h.id} className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {h.name} ({h.rows}×{h.columns})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
