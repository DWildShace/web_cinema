import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FamilyPackageCard } from '../components/FamilyPackageCard'
import { useFamilyPackages } from '../hooks/useFamilyPackages'

export function FamilyPackagePickerPage() {
  const [searchParams] = useSearchParams()
  const showtimeId = Number(searchParams.get('showtimeId')) || 0
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const { packages, loading, error } = useFamilyPackages(showtimeId || null)
  const navigate = useNavigate()

  if (loading) return <p className="p-4 text-lg text-gray-500">Đang tải gói...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center gap-1">
        ← Quay lại
      </button>
      <h1 className="text-3xl font-bold mb-6">Chọn gói gia đình</h1>
      {packages.length === 0 && (
        <p className="text-gray-500">Chưa có gói gia đình. Vui lòng thêm qua Admin API.</p>
      )}
      <div className="flex flex-col gap-4">
        {packages.map(pkg => (
          <FamilyPackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selectedPackageId === pkg.id}
            onSelect={() => setSelectedPackageId(pkg.id)}
          />
        ))}
      </div>
      {showtimeId === 0 && (
        <p className="mt-4 text-center text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
          Chức năng chọn suất chiếu đang được phát triển. Vui lòng quay lại sau.
        </p>
      )}
      <button
        disabled={!selectedPackageId || showtimeId === 0}
        onClick={() => navigate(`/family-booking/confirm?showtimeId=${showtimeId}&packageId=${selectedPackageId}`)}
        className="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white text-xl font-bold disabled:opacity-40 hover:bg-blue-700 transition-colors"
      >
        Tiếp tục
      </button>
    </div>
  )
}
