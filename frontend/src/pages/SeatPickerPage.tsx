import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getShowtimeById, getSeatsByShowtime, type ShowtimeDto, type SeatWithStatusDto } from '../api/showtimes'
import { createBooking } from '../api/bookings'
import { useAuthStore } from '../store/authStore'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
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

  const toggleSeat = (seat: SeatWithStatusDto) => {
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
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? 'Đặt vé thất bại. Vui lòng thử lại.')
      } else {
        setError('Đặt vé thất bại. Vui lòng thử lại.')
      }
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><p className="text-gray-500">Đang tải sơ đồ ghế...</p></div>
  if (error && !showtime) return <p className="p-4 text-red-600 text-center">{error}</p>
  if (!showtime) return null

  const maxRow = seats.reduce((m, s) => Math.max(m, s.row), 0)
  const maxCol = seats.reduce((m, s) => Math.max(m, s.column), 0)
  const seatMap = new Map(seats.map(s => [`${s.row}-${s.column}`, s]))

  const totalPrice = selected.size * Number(showtime.price)

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 hover:underline">← Quay lại</button>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{showtime.movieTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">{formatTime(showtime.startsAt)} · {showtime.cinemaName} · {showtime.hallName}</p>
        <p className="text-blue-600 font-medium mt-1">{formatPrice(Number(showtime.price))} / ghế</p>
      </div>

      {/* Screen */}
      <div className="bg-gray-200 text-gray-500 text-xs text-center py-1 rounded-full mb-6 mx-auto w-3/4">
        ── MÀN HÌNH ──
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto mb-6">
        <div className="inline-block min-w-full">
          {Array.from({ length: maxRow }, (_, ri) => ri + 1).map(row => (
            <div key={row} className="flex gap-1.5 mb-1.5 justify-center">
              <span className="w-5 text-xs text-gray-400 flex items-center justify-center">{row}</span>
              {Array.from({ length: maxCol }, (_, ci) => ci + 1).map(col => {
                const seat = seatMap.get(`${row}-${col}`)
                if (!seat) return <div key={col} className="w-8 h-8" />
                const isSelected = selected.has(seat.id)
                const isVip = seat.seatType === 'VIP'
                return (
                  <button
                    key={col}
                    onClick={() => toggleSeat(seat)}
                    disabled={!seat.isAvailable}
                    title={`Hàng ${row}, Cột ${col} (${seat.seatType})`}
                    className={`w-8 h-8 rounded text-xs font-semibold transition-all border
                      ${!seat.isAvailable ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed' :
                        isSelected ? (isVip ? 'bg-yellow-500 border-yellow-600 text-white' : 'bg-blue-600 border-blue-700 text-white') :
                        isVip ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100' :
                                 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'}`}
                  >
                    {col}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center mb-6 text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-50 border border-green-400 inline-block" /> Thường</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-50 border border-yellow-400 inline-block" /> VIP</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-600 inline-block" /> Đang chọn</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-300 inline-block" /> Đã đặt</span>
      </div>

      {/* Summary */}
      {error && <p className="mb-3 text-red-600 text-sm text-center">{error}</p>}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Đã chọn: <strong className="text-gray-900">{selected.size} ghế</strong></p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">Tổng: {formatPrice(totalPrice)}</p>
        </div>
        <button
          disabled={selected.size === 0 || booking}
          onClick={handleBook}
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          {booking ? 'Đang đặt...' : 'Đặt vé'}
        </button>
      </div>
    </div>
  )
}
