import { BrowserRouter, Routes, Route, Link, useSearchParams } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MovieListPage } from './pages/MovieListPage'
import { MovieDetailPage } from './pages/MovieDetailPage'
import { SeatPickerPage } from './pages/SeatPickerPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { FamilyMovieListPage } from './features/family-booking/pages/FamilyMovieListPage'
import { FamilyShowtimePage } from './features/family-booking/pages/FamilyShowtimePage'
import { FamilyPackagePickerPage } from './features/family-booking/pages/FamilyPackagePickerPage'
import { FamilyConfirmPage } from './features/family-booking/pages/FamilyConfirmPage'

function BookingSuccessPage() {
  const [params] = useSearchParams()
  const ticketCode = params.get('ticketCode')
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4 p-8">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-bold text-green-600">Đặt vé thành công!</h1>
      {ticketCode && (
        <p className="text-gray-600">Mã vé: <span className="font-mono font-bold text-gray-900">{ticketCode}</span></p>
      )}
      <p className="text-gray-500 text-center">Vé đã được xác nhận. Kiểm tra mục "Vé của tôi" để xem chi tiết.</p>
      <div className="flex gap-3 mt-2">
        <Link to="/my-bookings" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
          Xem vé của tôi
        </Link>
        <Link to="/" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">🎬 CinemaBooking</h1>
        <p className="text-gray-500 text-lg">Đặt vé xem phim nhanh chóng, tiện lợi</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          to="/movies"
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
        >
          Xem phim đang chiếu
        </Link>
        <Link
          to="/family-booking/movies"
          className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-colors text-center"
        >
          Đặt vé gia đình
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/movies" element={<MovieListPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/seat-picker" element={
              <ProtectedRoute><SeatPickerPage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="/booking-success" element={<BookingSuccessPage />} />

            {/* Family booking flow */}
            <Route path="/family-booking/movies" element={<FamilyMovieListPage />} />
            <Route path="/family-booking/showtimes" element={<FamilyShowtimePage />} />
            <Route path="/family-booking/packages" element={<FamilyPackagePickerPage />} />
            <Route path="/family-booking/confirm" element={
              <ProtectedRoute><FamilyConfirmPage /></ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
