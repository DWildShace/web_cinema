import { BrowserRouter, Routes, Route, Link, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRoute } from './components/RoleRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { SchedulePage } from './pages/SchedulePage'
import { MovieListPage } from './pages/MovieListPage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { SeatPickerPage } from './pages/SeatPickerPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { TicketDetailPage } from './pages/TicketDetailPage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { FamilyMovieListPage } from './features/family-booking/pages/FamilyMovieListPage'
import { FamilyShowtimePage } from './features/family-booking/pages/FamilyShowtimePage'
import { FamilyPackagePickerPage } from './features/family-booking/pages/FamilyPackagePickerPage'
import { FamilyConfirmPage } from './features/family-booking/pages/FamilyConfirmPage'
import { ManageDashboardPage } from './pages/manage/ManageDashboardPage'
import { ManageMoviesPage } from './pages/manage/ManageMoviesPage'
import { ManageShowtimesPage } from './pages/manage/ManageShowtimesPage'
import { ManageScanPage } from './pages/manage/ManageScanPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminCinemasPage } from './pages/admin/AdminCinemasPage'

function BookingSuccessPage() {
  const [params] = useSearchParams()
  const ticketCode = params.get('ticketCode')
  const bookingId = params.get('bookingId')
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4 pb-24 md:pb-0">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-4xl">
        🎉
      </div>
      <h1 className="text-2xl font-bold text-zinc-100 text-center">Đặt vé thành công!</h1>
      {ticketCode && (
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-white rounded-2xl">
            <QRCodeSVG value={ticketCode} size={160} level="H" includeMargin={false} />
          </div>
          <div className="px-5 py-2 rounded-xl bg-zinc-800 border border-zinc-700">
            <p className="text-xs text-zinc-500 text-center mb-0.5">Mã vé</p>
            <p className="font-mono font-bold text-green-400 text-base tracking-widest text-center">{ticketCode}</p>
          </div>
        </div>
      )}
      <div className="flex gap-3 mt-2">
        <Link
          to={bookingId ? `/my-tickets/${bookingId}` : '/my-tickets'}
          className="px-6 py-3 rounded-2xl bg-green-500 text-zinc-950 font-bold"
        >
          Xem vé
        </Link>
        <Link to="/" className="px-6 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
          Trang chủ
        </Link>
      </div>
    </div>
  )
}

function FamilyLandingPage() {
  return (
    <div className="px-4 pt-6 pb-24 md:pb-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">Gói gia đình</h1>
      <p className="text-zinc-400 text-sm mb-6">Đặt vé cho cả nhà — hệ thống tự chọn ghế liền nhau, giảm giá đến 20%.</p>

      <div className="space-y-3 mb-8">
        {[
          { icon: '🎯', title: 'Ghế liền nhau tự động', desc: 'Không cần tự tìm — hệ thống chọn ghế tốt nhất cho nhóm' },
          { icon: '💰', title: 'Giảm giá theo gói', desc: 'Tiết kiệm hơn so với mua vé lẻ từng người' },
          { icon: '👨‍👩‍👧', title: 'Phim phù hợp gia đình', desc: 'Lọc sẵn phim P/K/T13 — phù hợp mọi lứa tuổi' },
        ].map(item => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">{item.title}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/family/movies"
        className="block w-full py-4 rounded-2xl bg-green-500 text-zinc-950 font-bold text-center text-base"
      >
        Bắt đầu chọn phim →
      </Link>
    </div>
  )
}

const MANAGE_ROLES = ['CinemaManager', 'SysAdmin', 'Admin']
const ADMIN_ROLES = ['SysAdmin']

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <main>
          <Routes>
            {/* Customer */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/movies" element={<MovieListPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/seat-picker" element={
              <ProtectedRoute><SeatPickerPage /></ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="/my-tickets/:id" element={
              <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Family flow */}
            <Route path="/family" element={<FamilyLandingPage />} />
            <Route path="/family/movies" element={<FamilyMovieListPage />} />
            <Route path="/family/showtimes" element={<FamilyShowtimePage />} />
            <Route path="/family/packages" element={<FamilyPackagePickerPage />} />
            <Route path="/family/confirm" element={
              <ProtectedRoute><FamilyConfirmPage /></ProtectedRoute>
            } />
            {/* Legacy family routes */}
            <Route path="/family-booking/movies" element={<FamilyMovieListPage />} />
            <Route path="/family-booking/showtimes" element={<FamilyShowtimePage />} />
            <Route path="/family-booking/packages" element={<FamilyPackagePickerPage />} />
            <Route path="/family-booking/confirm" element={
              <ProtectedRoute><FamilyConfirmPage /></ProtectedRoute>
            } />

            {/* Cinema Management Portal */}
            <Route path="/manage" element={
              <RoleRoute allowedRoles={MANAGE_ROLES}><ManageDashboardPage /></RoleRoute>
            } />
            <Route path="/manage/movies" element={
              <RoleRoute allowedRoles={MANAGE_ROLES}><ManageMoviesPage /></RoleRoute>
            } />
            <Route path="/manage/showtimes" element={
              <RoleRoute allowedRoles={MANAGE_ROLES}><ManageShowtimesPage /></RoleRoute>
            } />
            <Route path="/manage/scan" element={
              <RoleRoute allowedRoles={[...MANAGE_ROLES, 'CinemaStaff']}><ManageScanPage /></RoleRoute>
            } />

            {/* System Admin Portal */}
            <Route path="/admin" element={
              <RoleRoute allowedRoles={ADMIN_ROLES}><AdminDashboardPage /></RoleRoute>
            } />
            <Route path="/admin/users" element={
              <RoleRoute allowedRoles={ADMIN_ROLES}><AdminUsersPage /></RoleRoute>
            } />
            <Route path="/admin/cinemas" element={
              <RoleRoute allowedRoles={ADMIN_ROLES}><AdminCinemasPage /></RoleRoute>
            } />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
