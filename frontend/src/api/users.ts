import { api } from './client'

export interface UserProfileDto {
  id: number
  email: string
  role: string
}

export const getProfile = () =>
  api.get<UserProfileDto>('/api/users/me').then(r => r.data)

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/api/users/me/password', { currentPassword, newPassword })

export interface UserListItemDto {
  id: number
  email: string
  role: string
}

export const getAllUsers = () =>
  api.get<UserListItemDto[]>('/api/users').then(r => r.data)

export const changeUserRole = (userId: number, role: string) =>
  api.put(`/api/users/${userId}/role`, { role })
