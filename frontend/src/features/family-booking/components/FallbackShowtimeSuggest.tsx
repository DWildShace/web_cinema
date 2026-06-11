interface Props {
  message: string
  alternativeShowtimeIds: number[]
  onSelectShowtime: (id: number) => void
}

export function FallbackShowtimeSuggest({ message, alternativeShowtimeIds, onSelectShowtime }: Props) {
  if (!message) return null
  return (
    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 mb-4">
      <p className="text-yellow-800 font-medium">{message}</p>
      {alternativeShowtimeIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {alternativeShowtimeIds.map(id => (
            <button
              key={id}
              onClick={() => onSelectShowtime(id)}
              className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-900 text-sm hover:bg-yellow-200"
            >
              Suất #{id}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
