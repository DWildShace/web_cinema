import type { FamilyPackagePricedDto } from '../../../api/familyBooking'

interface Props {
  pkg: FamilyPackagePricedDto
  selected: boolean
  onSelect: () => void
}

export function FamilyPackageCard({ pkg, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      style={{ minHeight: 56 }}
      className={`w-full rounded-xl border-2 p-5 text-left transition-all
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
    >
      <p className="text-xl font-bold text-gray-900">{pkg.name}</p>
      <p className="mt-1 text-base text-gray-500">
        {pkg.adultCount} người lớn + {pkg.childCount} trẻ em
      </p>
      <p className="mt-2 text-2xl font-extrabold text-blue-700">
        {pkg.totalPrice.toLocaleString('vi-VN')}đ
      </p>
    </button>
  )
}
