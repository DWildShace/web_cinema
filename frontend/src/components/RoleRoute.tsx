import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  allowedRoles: string[]
  children: React.ReactNode
}

export function RoleRoute({ allowedRoles, children }: Props) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />
  return <>{children}</>
}
