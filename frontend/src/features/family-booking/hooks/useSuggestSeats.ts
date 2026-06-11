import { useCallback, useEffect, useRef, useState } from 'react'
import { suggestSeats, type SuggestSeatsResult } from '../../../api/familyBooking'

export function useSuggestSeats(showtimeId: number, familyPackageId: number) {
  const [result, setResult] = useState<SuggestSeatsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [expired, setExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const suggest = useCallback(async () => {
    setLoading(true)
    try {
      const data = await suggestSeats(showtimeId, familyPackageId)
      setResult(data)
      setExpired(false)

      const totalSeconds = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
      )
      setSecondsLeft(totalSeconds)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(timerRef.current!)
            setExpired(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } finally {
      setLoading(false)
    }
  }, [showtimeId, familyPackageId])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const countdownLabel = expired
    ? 'Phiên đặt vé đã hết hạn, vui lòng thử lại'
    : `Ghế được giữ trong ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return { result, loading, suggest, countdownLabel, expired }
}
