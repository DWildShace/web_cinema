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

export const getAllMovies = () =>
  api.get<MovieDto[]>('/api/movies').then(r => r.data)

export const getMovieById = (id: number) =>
  api.get<MovieDto>(`/api/movies/${id}`).then(r => r.data)
