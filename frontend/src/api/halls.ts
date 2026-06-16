import { api } from './client'

export interface HallDto {
  id: number
  name: string
  rows: number
  columns: number
  cinemaName: string
}

export const getAllHalls = () =>
  api.get<HallDto[]>('/api/halls').then(r => r.data)
