import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getShowtimeById, getSeatsByShowtime, type ShowtimeDto, type SeatWithStatusDto } from '../api/showtimes'
import { createBooking } from '../api/bookings'
import { useAuthStore } from '../store/authStore'
import { SeatIcon } from '../components/SeatIcon'

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r) // 1→A, 2→B ...

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + 'đ'
}

export function SeatPickerPage() {
  const [params] = useSearchParams()
  const showtimeId = Number(params.get('showtimeId'))
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [showtime, setShowtime] = useState<ShowtimeDto | null>(null)
  const [seats, setSeats] = useState<SeatWithStatusDto[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showtimeId) return
    Promise.all([getShowtimeById(showtimeId), getSeatsByShowtime(showtimeId)])
      .then(([st, s]) => { setShowtime(st); setSeats(s) })
      .catch(() => setError('Không thể tải thông tin suất chiếu.'))
      .finally(() => setLoading(false))
  }, [showtimeId])

  const toggle = (seat: SeatWithStatusDto) => {
    if (!seat.isAvailable) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id)
      return next
    })
  }

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (selected.size === 0) return
    setBooking(true)
    setError(null)
    try {
      const result = await createBooking({ showtimeId, seatIds: [...selected] })
      navigate(`/booking-success?ticketCode=${result.ticketCode}`)
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Đặt vé thất bại.') : 'Đặt vé thất bại.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!showtime) return <p className="p-6 text-red-400 text-center">{error ?? 'Không tìm thấy suất chiếu.'}</p>

  const maxRow = seats.reduce((m, s) => Math.max(m, s.row), 0)
  const maxCol = seats.reduce((m, s) => Math.max(m, s.column), 0)
  const seatMap = new Map(seats.map(s => [`${s.row}-${s.column}`, s]))
  const totalPrice = selected.size * Number(showtime.price)

  return (
    <div className="pb-40 md:pb-6">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-zinc-100 truncate">{showtime.movieTitle}</p>
          <p className="text-xs text-zinc-500">{formatDate(showtime.startsAt)} · {formatTime(showtime.startsAt)} · {showtime.cinemaName}</p>
        </div>
      </div>

      {/* ── Screen ── */}
      <div className="mx-6 mt-4 mb-6 relative">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
        <div className="h-4 mx-8 bg-gradient-to-b from-zinc-700/30 to-transparent rounded-b-3xl" />
        <p className="text-center text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Màn hình</p>
      </div>

      {/* ── Seat grid ── */}
      <div className="overflow-x-auto scroll-hide px-4">
        <div className="inline-block min-w-max mx-auto">
          {/* Column numbers */}
          <div className="flex gap-1.5 mb-1 ml-7">
            {Array.from({ length: maxCol }, (_, i) => i + 1).map(col => (
              <div key={col} className="w-7 text-center text-[10px] text-zinc-600">{col}</div>
            ))}
          </div>

          {Array.from({ length: maxRow }, (_, ri) => ri + 1).map(row => (
            <div key={row} className="flex gap-1.5 mb-1.5 items-center">
              {/* Row label */}
              <div className="w-6 text-center text-xs text-zinc-500 font-semibold">{ROW_LABEL(row)}</div>

              {Array.from({ length: maxCol }, (_, ci) => ci + 1).map(col => {
                const seat = seatMap.get(`${row}-${col}`)
                if (!seat) return <div key={col} className="w-7 h-7" />

                const isSelected = selected.has(seat.id)
                const isVip = seat.seatType === 'VIP'

                return (
                  <button
                    key={col}
                    onClick={() => toggle(seat)}
                    disabled={!seat.isAvailable}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-all active:scale-90
                      ${!seat.isAvailable
                        ? 'text-zinc-700 cursor-not-allowed'
                        : isSelected
                          ? isVip ? 'text-yellow-400' : 'text-green-400'
                          : isVip ? 'text-yellow-700 hover:text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    <SeatIcon className="w-6 h-6" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 justify-center mt-4 mb-2 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5"><SeatIcon className="w-4 h-4 text-zinc-500" /> Trống</span>
        <span className="flex items-center gap-1.5"><SeatIcon className="w-4 h-4 text-yellow-700" /> VIP</span>
        <span className="flex items-center gap-1.5"><SeatIcon className="w-4 h-4 text-green-400" /> Đang chọn</span>
        <span className="flex items-center gap-1.5"><SeatIcon className="w-4 h-4 text-zinc-800" /> Đã đặt</span>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          {error && <p className="text-red-400 text-xs mb-1">{error}</p>}
          <p className="text-sm text-zinc-400">{selected.size} ghế đã chọn</p>
          <p className="text-lg font-bold text-zinc-100">{formatPrice(totalPrice)}</p>
        </div>
        <button
          onClick={handleBook}
          disabled={selected.size === 0 || booking}
          className="px-8 py-3.5 rounded-2xl bg-green-500 text-zinc-950 font-bold disabled:opacity-30 active:scale-95 transition-all"
        >
          {booking ? '...' : 'Đặt vé'}
        </button>
      </div>
    </div>
  )
}
