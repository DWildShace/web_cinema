import { api } from './client'

export interface MovieDto {
  id: number
  title: string
  genre: string
  duration: number
  posterUrl: string
  rating: number
  ageRating: string
  description: string
}

export interface CreateMovieDto {
  title: string
  genre: string
  duration: number
  posterUrl: string
  rating: number
  description?: string
}

export const getAllMovies = () =>
  api.get<MovieDto[]>('/api/movies').then(r => r.data)

export const getMovieById = (id: number) =>
  api.get<MovieDto>(`/api/movies/${id}`).then(r => r.data)

export const createMovie = (dto: CreateMovieDto) =>
  api.post<MovieDto>('/api/movies', dto).then(r => r.data)

export const updateMovie = (id: number, dto: Partial<CreateMovieDto>) =>
  api.put<MovieDto>(`/api/movies/${id}`, dto).then(r => r.data)

export const deleteMovie = (id: number) =>
  api.delete(`/api/movies/${id}`)
