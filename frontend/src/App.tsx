import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { FamilyMovieListPage } from './features/family-booking/pages/FamilyMovieListPage'
import { FamilyPackagePickerPage } from './features/family-booking/pages/FamilyPackagePickerPage'
import { FamilyConfirmPage } from './features/family-booking/pages/FamilyConfirmPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900">Cinema Booking</h1>
            <p className="text-gray-500">Chọn cách đặt vé của bạn</p>
            <div className="flex gap-4">
              <Link
                to="/family-booking/movies"
                className="px-8 py-4 bg-blue-600 text-white text-xl rounded-xl hover:bg-blue-700 transition-colors"
              >
                Đặt vé gia đình
              </Link>
            </div>
          </div>
        } />
        <Route path="/family-booking/movies" element={<FamilyMovieListPage />} />
        <Route path="/family-booking/packages" element={<FamilyPackagePickerPage />} />
        <Route path="/family-booking/confirm" element={<FamilyConfirmPage />} />
        <Route path="/booking-success" element={
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-4xl font-bold text-green-600">Đặt vé thành công!</h1>
            <p className="text-gray-500">Vé đã được xác nhận. Kiểm tra email để nhận QR code.</p>
            <Link to="/" className="text-blue-600 underline">Về trang chủ</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
