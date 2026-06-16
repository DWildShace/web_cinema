import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'
import { getBookingByCode, type BookingDto } from '../../api/bookings'

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r)

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} · ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

export function ManageScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [booking, setBooking] = useState<BookingDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastCode, setLastCode] = useState<string | null>(null)

  const lookup = async (code: string) => {
    if (!code.trim() || code === lastCode) return
    setLastCode(code)
    setLoading(true)
    setError(null)
    setBooking(null)
    try {
      const b = await getBookingByCode(code.trim().toUpperCase())
      setBooking(b)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404)
        setError('Không tìm thấy vé. Mã QR không hợp lệ.')
      else setError('Lỗi kết nối.')
    } finally {
      setLoading(false)
    }
  }

  const startScanner = async () => {
    setError(null)
    setBooking(null)
    setLastCode(null)
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    setScanning(true)
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { lookup(decodedText) },
        () => {}
      )
    } catch {
      setError('Không thể truy cập camera. Kiểm tra quyền truy cập.')
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
    setScanning(false)
  }

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}) }, [])

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault()
    setLastCode(null)
    lookup(manualCode)
  }

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-lg mx-auto">
      <h1 className="font-bold text-zinc-100 text-lg mb-6">Soát vé QR</h1>

      {/* Camera scanner */}
      <div className="mb-4">
        <div id="qr-reader" className={`rounded-2xl overflow-hidden ${scanning ? 'border border-zinc-700' : 'hidden'}`} />
        <div className="flex gap-2">
          {!scanning ? (
            <button
              onClick={startScanner}
              className="flex-1 py-3.5 rounded-2xl bg-green-500 text-zinc-950 font-bold text-sm"
            >
              📷 Mở camera quét QR
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex-1 py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm"
            >
              Dừng camera
            </button>
          )}
        </div>
      </div>

      {/* Manual input */}
      <div className="mb-4">
        <p className="text-xs text-zinc-500 mb-2">Hoặc nhập mã vé thủ công:</p>
        <form onSubmit={handleManual} className="flex gap-2">
          <input
            value={manualCode}
            onChange={e => setManualCode(e.target.value.toUpperCase())}
            placeholder="VD: A1B2C3D4E5F6"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
          />
          <button
            type="submit" disabled={loading || !manualCode.trim()}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold text-sm disabled:opacity-40"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Result */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-4xl mb-2">❌</p>
          <p className="text-red-400 font-semibold text-sm">{error}</p>
        </div>
      )}

      {booking && (
        <div className="bg-zinc-900 rounded-2xl border border-green-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-lg">✅</div>
            <p className="font-bold text-green-400">Vé hợp lệ</p>
          </div>
          <p className="font-bold text-zinc-100 text-base">{booking.movieTitle}</p>
          <p className="text-zinc-500 text-sm mt-1">{formatDateTime(booking.startsAt)}</p>
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
              </span>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 rounded-xl bg-zinc-800 inline-block">
            <p className="font-mono font-bold text-green-400 text-sm tracking-widest">{booking.ticketCode}</p>
          </div>
          <button
            onClick={() => { setBooking(null); setLastCode(null); setManualCode('') }}
            className="w-full mt-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm font-semibold"
          >
            Soát vé tiếp theo
          </button>
        </div>
      )}
    </div>
  )
}
