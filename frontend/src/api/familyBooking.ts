import { api } from './client'

export interface MovieDto {
  id: number
  title: string
  genre: string
  duration: number
  posterUrl: string
  rating: number
  ageRating: string
}

export interface FamilyPackagePricedDto {
  id: number
  name: string
  adultCount: number
  childCount: number
  totalPrice: number
}

export interface SeatDto {
  id: number
  row: number
  column: number
  seatType: string
}

export interface SuggestSeatsResult {
  seats: SeatDto[]
  isFallback: boolean
  fallbackMessage: string | null
  alternativeShowtimeIds: number[]
  expiresAt: string
  hallRows: number
  hallColumns: number
}

export interface CreateFamilyBookingDto {
  showtimeId: number
  familyPackageId: number
  seatIds: number[]
}

export interface BookingDto {
  id: number
  ticketCode: string
  showtimeId: number
  movieTitle: string
  startsAt: string
  seats: { seatId: number; row: number; column: number; seatType: string; status: string }[]
}

export const getFamilyFriendlyMovies = () =>
  api.get<MovieDto[]>('/api/movies/family-friendly').then(r => r.data)

export const getFamilyPackagesForShowtime = (showtimeId: number) =>
  api.get<FamilyPackagePricedDto[]>(`/api/showtimes/${showtimeId}/family-packages`).then(r => r.data)

export const suggestSeats = (showtimeId: number, familyPackageId: number) =>
  api.post<SuggestSeatsResult>(`/api/showtimes/${showtimeId}/seats/suggest`, { familyPackageId }).then(r => r.data)

export const createFamilyBooking = (dto: CreateFamilyBookingDto) =>
  api.post<BookingDto>('/api/bookings/family', dto).then(r => r.data)
