import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFamilyPackages } from '../hooks/useFamilyPackages'

export function FamilyPackagePickerPage() {
  const [searchParams] = useSearchParams()
  const showtimeId = Number(searchParams.get('showtimeId')) || 0
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const { packages, loading, error } = useFamilyPackages(showtimeId || null)
  const navigate = useNavigate()

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="p-6 text-red-400 text-center">{error}</p>

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">←</button>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Chọn gói gia đình</h1>
          <p className="text-xs text-zinc-500">Ghế liền nhau · giảm giá theo nhóm</p>
        </div>
      </div>

      {packages.length === 0 && (
        <p className="text-zinc-500 text-center py-8">Chưa có gói gia đình. Vui lòng thêm qua Admin.</p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {packages.map(pkg => {
          const isSelected = selectedPackageId === pkg.id
          return (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-green-500/10 border-green-500'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`font-bold text-base leading-tight ${isSelected ? 'text-green-400' : 'text-zinc-100'}`}>
                    {pkg.name}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-zinc-400">👨 {pkg.adultCount} người lớn</span>
                    <span className="text-zinc-400">👧 {pkg.childCount} trẻ em</span>
                  </div>
                  <p className="text-green-400 font-semibold text-sm mt-1.5">
                    {pkg.totalPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  isSelected ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {showtimeId === 0 && (
        <p className="mb-4 text-center text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-800 rounded-xl p-3">
          Vui lòng chọn suất chiếu trước.
        </p>
      )}

      <button
        disabled={!selectedPackageId || showtimeId === 0}
        onClick={() => navigate(`/family/confirm?showtimeId=${showtimeId}&packageId=${selectedPackageId}`)}
        className="w-full py-4 rounded-2xl bg-green-500 text-zinc-950 font-bold text-base disabled:opacity-30 active:scale-95 transition-all"
      >
        Tiếp tục
      </button>
    </div>
  )
}
