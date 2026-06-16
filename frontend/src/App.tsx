import { BrowserRouter, Routes, Route, Link, useSearchParams } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MovieListPage } from './pages/MovieListPage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { SeatPickerPage } from './pages/SeatPickerPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { FamilyMovieListPage } from './features/family-booking/pages/FamilyMovieListPage'
import { FamilyShowtimePage } from './features/family-booking/pages/FamilyShowtimePage'
import { FamilyPackagePickerPage } from './features/family-booking/pages/FamilyPackagePickerPage'
import { FamilyConfirmPage } from './features/family-booking/pages/FamilyConfirmPage'

function BookingSuccessPage() {
  const [params] = useSearchParams()
  const ticketCode = params.get('ticketCode')
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4 pb-24 md:pb-0">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-4xl">
        🎉
      </div>
      <h1 className="text-2xl font-bold text-zinc-100 text-center">Đặt vé thành công!</h1>
      {ticketCode && (
        <div className="px-6 py-3 rounded-2xl bg-zinc-800 border border-zinc-700">
          <p className="text-xs text-zinc-500 text-center mb-1">Mã vé</p>
          <p className="font-mono font-bold text-green-400 text-xl tracking-widest text-center">{ticketCode}</p>
        </div>
      )}
      <p className="text-zinc-500 text-center text-sm">Kiểm tra mục "Vé của tôi" để xem chi tiết và QR.</p>
      <div className="flex gap-3 mt-2">
        <Link to="/my-tickets" className="px-6 py-3 rounded-2xl bg-green-500 text-zinc-950 font-bold">
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/movies" element={<MovieListPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/seat-picker" element={
              <ProtectedRoute><SeatPickerPage /></ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            {/* legacy alias */}
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
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
