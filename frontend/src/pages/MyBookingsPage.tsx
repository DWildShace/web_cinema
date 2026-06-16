import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, type BookingDto } from '../api/bookings'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

function TicketCard({ booking }: { booking: BookingDto }) {
  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-100 text-base leading-tight">{booking.movieTitle}</p>
            <p className="text-zinc-500 text-sm mt-1">{formatDateTime(booking.startsAt)}</p>
          </div>
          <span className="text-[10px] font-mono bg-zinc-800 text-green-400 border border-zinc-700 px-2.5 py-1 rounded-lg whitespace-nowrap">
            {booking.ticketCode}
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

      {/* Barcode area */}
      <div className="px-5 py-4 flex items-center justify-center">
        <div className="flex gap-px">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="bg-zinc-300"
              style={{
                width: Math.random() > 0.5 ? 2 : 1,
                height: i % 7 === 0 ? 36 : 28,
                opacity: 0.6 + Math.random() * 0.4
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Không thể tải danh sách vé.'))
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
          {bookings.map(b => <TicketCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  )
}
