import { api } from './client'

export interface StatsDto {
  todayBookings: number
  totalBookings: number
  totalMovies: number
  totalCustomers: number
}

export const getStats = () =>
  api.get<StatsDto>('/api/stats').then(r => r.data)
