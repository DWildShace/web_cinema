import { useEffect, useState } from 'react'
import { getAllUsers, changeUserRole, type UserListItemDto } from '../../api/users'


const ROLES = ['Customer', 'CinemaStaff', 'CinemaManager']

const ROLE_BADGE: Record<string, string> = {
  Customer: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  CinemaStaff: 'bg-blue-500/10 text-blue-400 border-blue-800',
  CinemaManager: 'bg-purple-500/10 text-purple-400 border-purple-800',
  SysAdmin: 'bg-red-500/10 text-red-400 border-red-800',
  Admin: 'bg-red-500/10 text-red-400 border-red-800',
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getAllUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleRoleChange = async (userId: number, role: string) => {
    setChanging(userId)
    try {
      await changeUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch {
      alert('Không thể thay đổi role.')
    } finally {
      setChanging(null)
    }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-4 pt-4 pb-24 md:pb-6 max-w-2xl mx-auto">
      <h1 className="font-bold text-zinc-100 text-lg mb-4">Quản lý người dùng</h1>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Tìm kiếm email hoặc role..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors mb-4"
      />

      <p className="text-xs text-zinc-600 mb-3">{filtered.length} người dùng</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 flex-shrink-0">
                {u.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-100 text-sm truncate">{u.email}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_BADGE[u.role] ?? ROLE_BADGE.Customer}`}>
                  {u.role}
                </span>
              </div>
              {u.role === 'SysAdmin' ? (
                <span className="text-[10px] text-zinc-600 px-2">🔒 SysAdmin</span>
              ) : (
                <select
                  value={u.role}
                  disabled={changing === u.id}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-green-500 transition-colors disabled:opacity-40"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
