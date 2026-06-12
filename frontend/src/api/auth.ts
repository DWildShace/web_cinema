import { api } from './client'

export interface RegisterDto { email: string; password: string }
export interface LoginDto { email: string; password: string }
export interface AuthResultDto { token: string; email: string; role: string }

export const register = (dto: RegisterDto) =>
  api.post<AuthResultDto>('/api/auth/register', dto).then(r => r.data)

export const login = (dto: LoginDto) =>
  api.post<AuthResultDto>('/api/auth/login', dto).then(r => r.data)
