import axios from 'axios'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createFamilyBooking, suggestSeats, type SeatDto } from '../../../api/familyBooking'
import { getSeatsByShowtime, type SeatWithStatusDto } from '../../../api/showtimes'
import { SeatIcon } from '../../../components/SeatIcon'

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r)

function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + 'đ'
}

export function FamilyConfirmPage() {
  const [params] = useSearchParams()
  const showtimeId = Number(params.get('showtimeId'))
  const packageId = Number(params.get('packageId'))
  const seatCount = Number(params.get('seatCount')) || 0
  const totalPrice = Number(params.get('totalPrice')) || 0
  const packageName = params.get('packageName') || 'Gói gia đình'
  const navigate = useNavigate()

  // All seats from the showtime (for the interactive picker)
  const [allSeats, setAllSeats] = useState<SeatWithStatusDto[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [suggested, setSuggested] = useState<Set<number>>(new Set()) // highlighted differently on first load

  const [loadingSeats, setLoadingSeats] = useState(true)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const maxRow = allSeats.reduce((m, s) => Math.max(m, s.row), 0)
  const maxCol = allSeats.reduce((m, s) => Math.max(m, s.column), 0)
  const seatMap = new Map(allSeats.map(s => [`${s.row}-${s.column}`, s]))

  // Fetch all seats once
  useEffect(() => {
    getSeatsByShowtime(showtimeId)
      .then(setAllSeats)
      .catch(() => setError('Không thể tải sơ đồ ghế.'))
      .finally(() => setLoadingSeats(false))
  }, [showtimeId])

  // Auto-suggest on mount
  const runSuggest = useCallback(async () => {
    setLoadingSuggest(true)
    setError(null)
    try {
      const data = await suggestSeats(showtimeId, packageId)
      const ids = new Set(data.seats.map((s: SeatDto) => s.id))
      setSelected(ids)
      setSuggested(ids)
      const secs = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(secs)
      setTimerActive(true)
    } catch {
      setError('Không thể tìm ghế phù hợp. Vui lòng thử lại.')
    } finally {
      setLoadingSuggest(false)
    }
  }, [showtimeId, packageId])

  useEffect(() => { runSuggest() }, [runSuggest])

  // Countdown timer
  useEffect(() => {
    if (!timerActive) return
    if (secondsLeft <= 0) { setTimerActive(false); return }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timerActive, secondsLeft])

  const expired = timerActive && secondsLeft === 0

  // Toggle seat: max = seatCount
  const toggle = (seat: SeatWithStatusDto) => {
    if (!seat.isAvailable && !selected.has(seat.id)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(seat.id)) {
        next.delete(seat.id)
      } else {
        if (next.size >= seatCount) return prev // đủ rồi, không thêm
        next.add(seat.id)
      }
      return next
    })
  }

  const handleConfirm = async () => {
    if (selected.size !== seatCount || expired) return
    setConfirming(true)
    setError(null)
    try {
      const result = await createFamilyBooking({
        showtimeId,
        familyPackageId: packageId,
        seatIds: [...selected],
      })
      navigate(`/booking-success?ticketCode=${result.ticketCode}&bookingId=${result.id}`)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError('Một hoặc nhiều ghế vừa bị đặt bởi người khác. Hãy chọn lại hoặc bấm "Gợi ý lại".')
        } else {
          setError(err.response?.data?.error ?? 'Đặt vé thất bại. Vui lòng thử lại.')
        }
      } else {
        setError('Đặt vé thất bại. Vui lòng thử lại.')
      }
    } finally {
      setConfirming(false)
    }
  }

  if (loadingSeats || loadingSuggest) return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3 p-6">
      <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-sm">
        {loadingSeats ? 'Đang tải sơ đồ ghế...' : 'Đang tìm ghế tốt nhất cho gia đình...'}
      </p>
    </div>
  )

  return (
    <div className="pb-36 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">←</button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-zinc-100 truncate">{packageName}</p>
          <p className="text-xs text-zinc-500">Chọn {seatCount} ghế liền nhau</p>
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded-lg ${
          expired ? 'bg-red-500/10 text-red-400' :
          secondsLeft < 60 ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {expired ? 'Hết giờ' : secondsLeft > 0 ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}` : ''}
        </div>
      </div>

      {/* Screen indicator */}
      <div className="mx-6 mt-4 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
        <div className="h-3 mx-8 bg-gradient-to-b from-zinc-700/30 to-transparent rounded-b-3xl" />
        <p className="text-center text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Màn hình</p>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto scroll-hide px-4">
        <div className="inline-block min-w-max mx-auto">
          {/* Column numbers */}
          <div className="flex gap-1.5 mb-1 ml-7">
            {Array.from({ length: maxCol }, (_, i) => (
              <div key={i} className="w-7 text-center text-[10px] text-zinc-600">{i + 1}</div>
            ))}
          </div>

          {Array.from({ length: maxRow }, (_, ri) => ri + 1).map(row => (
            <div key={row} className="flex gap-1.5 mb-1.5 items-center">
              <div className="w-6 text-center text-xs text-zinc-500 font-semibold">{ROW_LABEL(row)}</div>
              {Array.from({ length: maxCol }, (_, ci) => ci + 1).map(col => {
                const seat = seatMap.get(`${row}-${col}`)
                if (!seat) return <div key={col} className="w-7 h-7" />

                const isSel = selected.has(seat.id)
                const isSugg = suggested.has(seat.id) && isSel
                const isVip = seat.seatType === 'VIP'
                const atMax = selected.size >= seatCount && !isSel

                return (
                  <button
                    key={col}
                    onClick={() => toggle(seat)}
                    disabled={!seat.isAvailable && !isSel}
                    title={atMax && seat.isAvailable ? `Đã đủ ${seatCount} ghế` : undefined}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-all active:scale-90
                      ${!seat.isAvailable && !isSel
                        ? 'text-zinc-800 cursor-not-allowed'
                        : isSel
                          ? isSugg
                            ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]'
                            : 'text-green-300'
                          : atMax
                            ? 'text-zinc-700 cursor-not-allowed'
                            : isVip
                              ? 'text-yellow-700 hover:text-yellow-500'
                              : 'text-zinc-500 hover:text-zinc-300'
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-3 mb-2 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1"><SeatIcon className="w-4 h-4 text-zinc-500" /> Trống</span>
        <span className="flex items-center gap-1"><SeatIcon className="w-4 h-4 text-yellow-700" /> VIP</span>
        <span className="flex items-center gap-1"><SeatIcon className="w-4 h-4 text-green-400" /> Đang chọn</span>
        <span className="flex items-center gap-1"><SeatIcon className="w-4 h-4 text-zinc-800" /> Đã đặt</span>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 px-4 py-3">
        {error && (
          <p className="text-red-400 text-xs text-center mb-2">{error}</p>
        )}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <p className="text-sm text-zinc-400">
              <span className={selected.size === seatCount ? 'text-green-400 font-semibold' : 'text-zinc-300'}>
                {selected.size}
              </span>
              <span className="text-zinc-600">/{seatCount} ghế</span>
            </p>
            {totalPrice > 0 && (
              <p className="text-lg font-bold text-zinc-100">{formatPrice(totalPrice)}</p>
            )}
          </div>
          <button
            onClick={runSuggest}
            disabled={loadingSuggest}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold disabled:opacity-40"
          >
            {loadingSuggest ? '...' : 'Gợi ý lại'}
          </button>
        </div>
        <button
          onClick={handleConfirm}
          disabled={selected.size !== seatCount || confirming || expired}
          className="w-full py-4 rounded-2xl bg-green-500 text-zinc-950 font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
        >
          {confirming ? 'Đang đặt...' : selected.size !== seatCount
            ? `Chọn thêm ${seatCount - selected.size} ghế`
            : 'Xác nhận & Đặt vé'}
        </button>
      </div>
    </div>
  )
}
