const colors: Record<string, string> = {
  P: 'bg-green-100 text-green-800',
  K: 'bg-blue-100 text-blue-800',
  T13: 'bg-yellow-100 text-yellow-800',
  T16: 'bg-orange-100 text-orange-800',
  T18: 'bg-red-100 text-red-800',
}

export function AgeRatingBadge({ rating }: { rating: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold ${colors[rating] ?? 'bg-gray-100 text-gray-700'}`}>
      {rating}
    </span>
  )
}
