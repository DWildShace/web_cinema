import type { SeatDto } from '../../../api/familyBooking'
import { SeatIcon } from '../../../components/SeatIcon'

interface Props {
  rows: number
  columns: number
  suggestedSeats: SeatDto[]
}

const ROW_LABEL = (r: number) => String.fromCharCode(64 + r)

export function SeatMapPreview({ rows, columns, suggestedSeats }: Props) {
  const suggestedSet = new Set(suggestedSeats.map(s => `${s.row}-${s.column}`))

  return (
    <div className="overflow-x-auto scroll-hide">
      {/* Screen */}
      <div className="mx-4 mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />
        <div className="h-3 mx-6 bg-gradient-to-b from-zinc-700/30 to-transparent rounded-b-2xl" />
        <p className="text-center text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Màn hình</p>
      </div>

      <div className="inline-block mx-auto">
        {/* Column numbers */}
        <div className="flex gap-1 mb-1 ml-6">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="w-6 text-center text-[9px] text-zinc-600">{i + 1}</div>
          ))}
        </div>

        {Array.from({ length: rows }, (_, ri) => (
          <div key={ri} className="flex gap-1 mb-1 items-center">
            <div className="w-5 text-center text-[9px] text-zinc-500 font-semibold">{ROW_LABEL(ri + 1)}</div>
            {Array.from({ length: columns }, (_, ci) => {
              const key = `${ri + 1}-${ci + 1}`
              const isSelected = suggestedSet.has(key)
              return (
                <div key={ci} className={`w-6 h-6 flex items-center justify-center transition-colors
                  ${isSelected ? 'text-green-400' : 'text-zinc-700'}`}
                >
                  <SeatIcon className="w-5 h-5" />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-3 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1"><SeatIcon className="w-3.5 h-3.5 text-zinc-700" /> Trống</span>
        <span className="flex items-center gap-1"><SeatIcon className="w-3.5 h-3.5 text-green-400" /> Được chọn</span>
      </div>
    </div>
  )
}
