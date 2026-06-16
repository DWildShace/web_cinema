import { api } from './client'

export interface HallSummary {
  id: number
  name: string
  rows: number
  columns: number
}

export interface CinemaDto {
  id: number
  name: string
  location: string
  hallCount: number
  halls: HallSummary[]
}

export const getAllCinemas = () =>
  api.get<CinemaDto[]>('/api/cinemas').then(r => r.data)

export const createCinema = (name: string, location: string) =>
  api.post<CinemaDto>('/api/cinemas', { name, location }).then(r => r.data)
