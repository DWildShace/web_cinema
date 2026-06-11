import type { SeatDto } from '../../../api/familyBooking'

interface Props {
  rows: number
  columns: number
  suggestedSeats: SeatDto[]
}

export function SeatMapPreview({ rows, columns, suggestedSeats }: Props) {
  const suggestedIds = new Set(suggestedSeats.map(s => s.id))

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 text-center text-sm text-gray-500 tracking-widest">MÀN HÌNH</div>
      <div className="h-1 rounded bg-gray-300 mb-6 mx-8" />
      <div className="flex flex-col gap-1 items-center">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-1">
            {Array.from({ length: columns }, (_, c) => {
              const match = suggestedSeats.find(s => s.row === r + 1 && s.column === c + 1)
              const isSelected = match !== undefined && suggestedIds.has(match.id)
              return (
                <div
                  key={c}
                  className={`w-6 h-6 rounded-t-md flex items-center justify-center
                    ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
