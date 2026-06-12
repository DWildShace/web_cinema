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

  useEffect(() => { suggest() }, [suggest])

  const handleConfirm = async () => {
    if (!result || result.seats.length === 0) return
    setConfirmError(null)
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
          setConfirmError('Phiên đặt vé đã hết hạn. Vui lòng bấm "Đổi vị trí khác" để yêu cầu ghế mới.')
        } else if (err.response?.status === 409) {
          setConfirmError('Ghế vừa được đặt bởi người khác. Vui lòng bấm "Đổi vị trí khác" để chọn lại.')
        } else {
          setConfirmError('Đặt vé thất bại. Vui lòng thử lại.')
        }
      } else {
        setConfirmError('Đặt vé thất bại. Vui lòng thử lại.')
      }
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 p-4">
      <p className="text-lg text-gray-500">Đang tìm ghế tốt nhất cho gia đình...</p>
    </div>
  )

  if (suggestError) return (
    <div className="flex flex-col items-center justify-center min-h-64 p-4 gap-4">
      <p className="text-red-600 text-lg">{suggestError}</p>
      <button onClick={suggest} className="px-6 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">
        Thử lại
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center gap-1">
        ← Quay lại
      </button>
      <h1 className="text-3xl font-bold mb-4">Xác nhận ghế</h1>

      {result && (
        <>
          {result.isFallback && (
            <FallbackShowtimeSuggest
              message={result.fallbackMessage ?? ''}
              alternativeShowtimeIds={result.alternativeShowtimeIds}
              onSelectShowtime={id => navigate(`/family-booking/confirm?showtimeId=${id}&packageId=${packageId}`)}
            />
          )}

          {result.seats.length > 0 && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <SeatMapPreview rows={result.hallRows || 10} columns={result.hallColumns || 10} suggestedSeats={result.seats} />
                <p className={`mt-4 text-center font-medium ${expired ? 'text-red-600' : 'text-gray-600'}`}>
                  {countdownLabel}
                </p>
              </div>

              {confirmError && (
                <p className="mb-3 text-red-600 text-sm text-center">{confirmError}</p>
              )}
              <button
                disabled={expired}
                onClick={handleConfirm}
                className="w-full py-4 rounded-xl bg-green-600 text-white text-xl font-bold disabled:opacity-40 hover:bg-green-700 transition-colors"
              >
                Xác nhận & Thanh toán
              </button>
              <button
                onClick={suggest}
                className="mt-3 w-full py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
