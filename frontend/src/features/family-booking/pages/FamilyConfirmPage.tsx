import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createFamilyBooking } from '../../../api/familyBooking'
import { SeatMapPreview } from '../components/SeatMapPreview'
import { FallbackShowtimeSuggest } from '../components/FallbackShowtimeSuggest'
import { useSuggestSeats } from '../hooks/useSuggestSeats'

export function FamilyConfirmPage() {
  const [params] = useSearchParams()
  const showtimeId = Number(params.get('showtimeId'))
  const packageId = Number(params.get('packageId'))
  const navigate = useNavigate()

  const { result, loading, suggest, countdownLabel, expired, error: suggestError } = useSuggestSeats(showtimeId, packageId)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => { suggest() }, [suggest])

  const handleConfirm = async () => {
    if (!result || result.seats.length === 0) return
    setConfirmError(null)
    setConfirming(true)
    try {
      await createFamilyBooking({
        showtimeId,
        familyPackageId: packageId,
        seatIds: result.seats.map(s => s.id),
      })
      navigate('/booking-success')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setConfirmError('Phiên đặt vé đã hết hạn. Bấm "Đổi vị trí" để chọn ghế mới.')
        } else if (err.response?.status === 409) {
          setConfirmError('Ghế vừa được đặt bởi người khác. Bấm "Đổi vị trí" để chọn lại.')
        } else {
          setConfirmError('Đặt vé thất bại. Vui lòng thử lại.')
        }
      } else {
        setConfirmError('Đặt vé thất bại. Vui lòng thử lại.')
      }
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3 p-6">
      <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-sm">Đang tìm ghế tốt nhất cho gia đình...</p>
    </div>
  )

  if (suggestError) return (
    <div className="flex flex-col items-center justify-center min-h-64 p-6 gap-4">
      <p className="text-4xl">😔</p>
      <p className="text-red-400 text-center">{suggestError}</p>
      <button onClick={suggest} className="px-6 py-3 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700">
        Thử lại
      </button>
    </div>
  )

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">←</button>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Xác nhận ghế</h1>
          <p className="text-xs text-zinc-500">Hệ thống đã chọn ghế tốt nhất</p>
        </div>
      </div>

      {result && (
        <>
          {result.isFallback && (
            <FallbackShowtimeSuggest
              message={result.fallbackMessage ?? ''}
              alternativeShowtimeIds={result.alternativeShowtimeIds}
              onSelectShowtime={id => navigate(`/family/confirm?showtimeId=${id}&packageId=${packageId}`)}
            />
          )}

          {result.seats.length > 0 && (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
                <SeatMapPreview
                  rows={result.hallRows || 10}
                  columns={result.hallColumns || 10}
                  suggestedSeats={result.seats}
                />
                <p className={`mt-4 text-center text-sm font-medium ${expired ? 'text-red-400' : 'text-zinc-400'}`}>
                  {countdownLabel}
                </p>
              </div>

              {confirmError && (
                <div className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  {confirmError}
                </div>
              )}

              <button
                disabled={expired || confirming}
                onClick={handleConfirm}
                className="w-full py-4 rounded-2xl bg-green-500 text-zinc-950 font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
              >
                {confirming ? 'Đang đặt...' : 'Xác nhận & Đặt vé'}
              </button>
              <button
                onClick={suggest}
                className="mt-3 w-full py-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold active:scale-95 transition-all"
              >
                Đổi vị trí khác
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
