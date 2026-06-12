import { api } from './client'

export interface ShowtimeDto {
  id: number
  movieId: number
  movieTitle: string
  hallId: number
  hallName: string
  cinemaName: string
  startsAt: string
  price: number
}

export interface SeatWithStatusDto {
  id: number
  row: number
  column: number
  seatType: string
  isAvailable: boolean
}

export const getShowtimesByMovie = (movieId: number) =>
  api.get<ShowtimeDto[]>(`/api/movies/${movieId}/showtimes`).then(r => r.data)

export const getShowtimeById = (id: number) =>
  api.get<ShowtimeDto>(`/api/showtimes/${id}`).then(r => r.data)

export const getSeatsByShowtime = (id: number) =>
  api.get<SeatWithStatusDto[]>(`/api/showtimes/${id}/seats`).then(r => r.data)
