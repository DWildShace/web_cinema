import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings, type BookingDto } from '../api/bookings'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
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

  if (loading) return <div className="flex justify-center p-12"><p className="text-gray-500">Đang tải vé...</p></div>
  if (error) return <p className="p-4 text-red-600 text-center">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vé của tôi</h1>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Bạn chưa có vé nào.</p>
          <Link to="/movies" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
            Đặt vé ngay
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {bookings.map(b => (
          <div key={b.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{b.movieTitle}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{formatDateTime(b.startsAt)}</p>
              </div>
              <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {b.ticketCode}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {b.seats.map(s => (
                <span
                  key={s.seatId}
                  className={`text-xs px-2 py-1 rounded font-medium ${s.seatType === 'VIP' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                >
                  Hàng {s.row} - Cột {s.column} ({s.seatType})
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
