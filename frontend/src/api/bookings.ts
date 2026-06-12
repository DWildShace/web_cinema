import { api } from './client'

export interface BookingSeatDto {
  seatId: number
  row: number
  column: number
  seatType: string
  status: string
}

export interface BookingDto {
  id: number
  ticketCode: string
  showtimeId: number
  movieTitle: string
  startsAt: string
  seats: BookingSeatDto[]
}

export interface CreateBookingDto {
  showtimeId: number
  seatIds: number[]
}

export const getMyBookings = () =>
  api.get<BookingDto[]>('/api/bookings').then(r => r.data)

export const getBookingById = (id: number) =>
  api.get<BookingDto>(`/api/bookings/${id}`).then(r => r.data)

export const createBooking = (dto: CreateBookingDto) =>
  api.post<BookingDto>('/api/bookings', dto).then(r => r.data)
