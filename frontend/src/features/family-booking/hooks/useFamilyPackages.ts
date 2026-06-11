import { useEffect, useState } from 'react'
import { getFamilyPackagesForShowtime, type FamilyPackagePricedDto } from '../../../api/familyBooking'

export function useFamilyPackages(showtimeId: number | null) {
  const [packages, setPackages] = useState<FamilyPackagePricedDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showtimeId) return
    setLoading(true)
    getFamilyPackagesForShowtime(showtimeId)
      .then(setPackages)
      .catch(() => setError('Không thể tải danh sách gói.'))
      .finally(() => setLoading(false))
  }, [showtimeId])

  return { packages, loading, error }
}
