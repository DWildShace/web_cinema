import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getBookingById, type BookingDto } from '../api/bookings'

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r)

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getBookingById(Number(id))
      .then(setBooking)
      .catch(() => setError('Không tìm thấy vé này.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error || !booking) return (
    <div className="text-center p-8">
      <p className="text-red-400 mb-4">{error ?? 'Không tìm thấy vé.'}</p>
      <Link to="/my-tickets" className="text-green-400 underline">Quay lại vé của tôi</Link>
    </div>
  )

  return (
    <div className="pb-24 md:pb-6 max-w-sm mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">←</button>
        <h1 className="font-bold text-zinc-100">Chi tiết vé</h1>
      </div>

      {/* Ticket card */}
      <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
        {/* Top info */}
        <div className="px-5 pt-5 pb-4">
          <p className="font-bold text-zinc-100 text-lg leading-tight">{booking.movieTitle}</p>
          <p className="text-zinc-500 text-sm mt-1">{formatDateTime(booking.startsAt)}</p>

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
                {ROW_LABEL(s.row)}{s.column}
                {s.seatType === 'VIP' && <span className="ml-1 text-[10px]">VIP</span>}
              </span>
            ))}
          </div>

          {/* Ticket code */}
          <div className="mt-3 px-3 py-2 rounded-xl bg-zinc-800 inline-block">
            <p className="text-[10px] text-zinc-500 mb-0.5">Mã vé</p>
            <p className="font-mono font-bold text-green-400 text-sm tracking-widest">{booking.ticketCode}</p>
          </div>
        </div>

        {/* Notch divider */}
        <div className="relative flex items-center">
          <div className="w-4 h-4 rounded-full bg-zinc-950 -ml-2 flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-zinc-800" />
          <div className="w-4 h-4 rounded-full bg-zinc-950 -mr-2 flex-shrink-0" />
        </div>

        {/* QR Code */}
        <div className="px-5 py-6 flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG
              value={booking.ticketCode}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-zinc-500 text-center">Xuất trình QR tại quầy soát vé</p>
        </div>
      </div>

      <Link
        to="/my-tickets"
        className="block mt-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-center text-sm"
      >
        ← Tất cả vé
      </Link>
    </div>
  )
}
