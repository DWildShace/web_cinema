import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getMyBookings, cancelBooking, type BookingDto } from '../api/bookings'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

const STATUS_STYLE: Record<string, string> = {
  Confirmed:  'bg-green-500/10 text-green-400 border-green-800',
  CheckedIn:  'bg-blue-500/10 text-blue-400 border-blue-800',
  Cancelled:  'bg-zinc-800 text-zinc-500 border-zinc-700',
}
const STATUS_LABEL: Record<string, string> = {
  Confirmed: 'Đã xác nhận',
  CheckedIn: 'Đã vào rạp',
  Cancelled: 'Đã huỷ',
}

function TicketCard({ booking, onCancel }: { booking: BookingDto; onCancel: (id: number) => void }) {
  const isCancelled = booking.status === 'Cancelled'

  return (
    <div className={`bg-zinc-900 rounded-3xl overflow-hidden border transition-opacity ${isCancelled ? 'border-zinc-800 opacity-60' : 'border-zinc-800'}`}>
      <Link to={`/my-tickets/${booking.id}`} className="block active:scale-[0.98] transition-transform">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-zinc-100 text-base leading-tight">{booking.movieTitle}</p>
              <p className="text-zinc-500 text-sm mt-0.5">{booking.cinemaName} · {booking.hallName}</p>
              <p className="text-zinc-500 text-sm mt-0.5">{formatDateTime(booking.startsAt)}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLE[booking.status] ?? STATUS_STYLE.Confirmed}`}>
              {STATUS_LABEL[booking.status] ?? booking.status}
            </span>
          </div>

          {/* Seats */}
          <div className="flex flex-wrap gap-2 mt-3">
            {booking.seats.map(s => (
              <span
                key={s.seatId}
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  s.seatType === 'VIP'
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-800'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}
              >
                {String.fromCharCode(64 + s.row)}{s.column}
              </span>
            ))}
          </div>
        </div>

        {/* Divider with notches */}
        <div className="relative flex items-center">
          <div className="w-4 h-4 rounded-full bg-zinc-950 -ml-2 flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-zinc-800" />
          <div className="w-4 h-4 rounded-full bg-zinc-950 -mr-2 flex-shrink-0" />
        </div>

        {/* QR preview */}
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className={`p-2 bg-white rounded-xl ${isCancelled ? 'grayscale' : ''}`}>
            <QRCodeSVG value={booking.ticketCode} size={64} level="M" includeMargin={false} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-zinc-500 mb-0.5">Mã vé</p>
            <p className="font-mono font-bold text-green-400 text-sm tracking-widest truncate">{booking.ticketCode}</p>
            <p className="text-xs text-zinc-600 mt-1">Nhấn để xem QR đầy đủ →</p>
          </div>
        </div>
      </Link>

      {/* Cancel button — only for confirmed bookings */}
      {booking.status === 'Confirmed' && (
        <div className="px-5 pb-4">
          <button
            onClick={() => onCancel(booking.id)}
            className="w-full py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-red-800 hover:text-red-400 transition-colors"
          >
            Huỷ vé
          </button>
        </div>
      )}
    </div>
  )
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Không thể tải danh sách vé.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc muốn huỷ vé này không?')) return
    try {
      await cancelBooking(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b))
    } catch {
      alert('Không thể huỷ vé. Vui lòng thử lại.')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="p-6 text-red-400 text-center">{error}</p>

  const active = bookings.filter(b => b.status !== 'Cancelled')
  const cancelled = bookings.filter(b => b.status === 'Cancelled')

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Vé của tôi</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎟</p>
          <p className="text-zinc-500 mb-6">Bạn chưa có vé nào.</p>
          <Link
            to="/movies"
            className="px-6 py-3 rounded-2xl bg-green-500 text-zinc-950 font-bold inline-block"
          >
            Đặt vé ngay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {active.map(b => <TicketCard key={b.id} booking={b} onCancel={handleCancel} />)}
          {cancelled.length > 0 && (
            <>
              <p className="text-xs text-zinc-600 mt-2">Vé đã huỷ</p>
              {cancelled.map(b => <TicketCard key={b.id} booking={b} onCancel={handleCancel} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}
