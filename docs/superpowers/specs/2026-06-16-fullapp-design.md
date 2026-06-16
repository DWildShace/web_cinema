# Cinema Booking — Kế Hoạch Toàn Diện
**Date:** 2026-06-16
**Status:** Draft — chờ duyệt trước khi implement

---

## 1. Tổng quan 3 Portal

Toàn bộ hệ thống gồm **3 giao diện web riêng biệt**, cùng dùng chung 1 backend API:

```
┌─────────────────────────────────────────────────────────────┐
│                        Backend API                          │
│              (ASP.NET Core · PostgreSQL · JWT)              │
└───────────────────┬──────────────┬──────────────────────────┘
                    │              │                    │
          ┌─────────▼──────┐ ┌────▼──────────┐ ┌──────▼──────┐
          │  Customer Web  │ │  Cinema Web   │ │  Admin Web  │
          │   (port 5173)  │ │  (port 5174)  │ │ (port 5175) │
          │  Khách hàng    │ │  Quản lý rạp  │ │  Hệ thống   │
          └────────────────┘ └───────────────┘ └─────────────┘
```

---

## 2. Phân Quyền (RBAC)

### Bảng Role

| Role | Mô tả | Ai dùng |
|------|-------|---------|
| `Guest` | Chưa đăng nhập | Người ghé thăm |
| `Customer` | Đã đăng nhập | Khách mua vé |
| `CinemaStaff` | Nhân viên quét vé | Soát vé tại rạp |
| `CinemaManager` | Quản lý rạp | Tạo suất chiếu, xem báo cáo |
| `SysAdmin` | Quản trị toàn hệ thống | IT/Vận hành |

### Ma trận quyền

| Hành động | Guest | Customer | CinemaStaff | CinemaManager | SysAdmin |
|-----------|-------|----------|-------------|---------------|----------|
| Xem phim / lịch chiếu | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đặt vé | ✗ | ✓ | ✗ | ✗ | ✗ |
| Xem lịch sử vé của mình | ✗ | ✓ | ✗ | ✗ | ✗ |
| Quét QR soát vé | ✗ | ✗ | ✓ | ✓ | ✓ |
| CRUD phim | ✗ | ✗ | ✗ | ✓ | ✓ |
| CRUD suất chiếu | ✗ | ✗ | ✗ | ✓ | ✓ |
| Quản lý gói gia đình | ✗ | ✗ | ✗ | ✓ | ✓ |
| Xem doanh thu rạp | ✗ | ✗ | ✗ | ✓ | ✓ |
| Quản lý rạp / phòng chiếu | ✗ | ✗ | ✗ | ✗ | ✓ |
| Quản lý user toàn hệ thống | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 3. Portal 1 — Customer Web

> Đây là mặt tiền của sản phẩm. Phải **sạch, nhanh, không rác**.

### 3.1 Nguyên tắc UX cứng

- **Không quảng cáo banner, popup, auto-play video**
- **Không dark pattern:** không pre-check add-on, không fake countdown, không upsell ép buộc
- **Mobile-first:** thiết kế cho màn hình 390px trước, desktop là bonus
- **Gia đình:** font lớn hơn 20%, tap target tối thiểu 56px, tối đa 3 bước/màn hình
- **Thường:** linh hoạt, nhanh, ít click nhất có thể

### 3.2 Trang chủ — 2 lối vào rõ ràng

```
┌─────────────────────────────────────────────┐
│   🎬 CinemaBooking                    [☰]  │
├─────────────────────────────────────────────┤
│                                             │
│   [Poster phim đang hot — hero image]       │
│                                             │
│   ┌─────────────┐    ┌─────────────────┐   │
│   │  🎟 Đặt vé  │    │  👨‍👩‍👧 Gói gia đình  │   │
│   │   thường    │    │  (gợi ý ghế tự  │   │
│   │             │    │   động, giảm giá│   │
│   └─────────────┘    └─────────────────┘   │
│                                             │
│   📽 Đang chiếu                            │
│   [Movie card grid]                         │
│                                             │
│   🔜 Sắp chiếu                             │
│   [Movie card grid]                         │
└─────────────────────────────────────────────┘
```

### 3.3 Sitemap Customer Web

```
/                           → Trang chủ
├── /movies                 → Danh sách phim
│   └── /movies/:id         → Chi tiết phim + lịch chiếu
│
├── /login                  → Đăng nhập
├── /register               → Đăng ký
├── /forgot-password        → Quên mật khẩu
│
├── [LUỒNG THƯỜNG]
│   ├── /seat-picker        → Chọn ghế (?showtimeId=X)
│   └── /booking-success    → Đặt thành công
│
├── [LUỒNG GIA ĐÌNH]
│   ├── /family             → Landing page gia đình
│   ├── /family/movies      → Phim phù hợp (P/K/T13 ưu tiên)
│   ├── /family/showtimes   → Chọn suất chiếu (?movieId=X)
│   ├── /family/packages    → Chọn gói (?showtimeId=X)
│   └── /family/confirm     → Xác nhận ghế tự động (?showtimeId=X&packageId=Y)
│
└── [KHU VỰC CÁ NHÂN — cần đăng nhập]
    ├── /profile            → Thông tin tài khoản
    ├── /my-tickets         → Lịch sử vé
    └── /my-tickets/:id     → Chi tiết vé + QR code
```

### 3.4 Luồng người dùng THƯỜNG

```
Trang chủ
   │
   ▼
Danh sách phim (/movies)
   │  [click vào phim]
   ▼
Chi tiết phim (/movies/:id)
   │  Phim info + ảnh lớn
   │  Chọn ngày (date chips ngang)
   │  Chọn suất chiếu + định dạng (2D/3D)
   │  [chọn suất → redirect]
   ▼
Chọn ghế (/seat-picker?showtimeId=X)
   │  Sơ đồ ghế dark theme
   │  Scroll ngang nếu cần
   │  Sticky bottom: "N ghế · Tổng Xđ" + [Đặt vé]
   │  → Nếu chưa đăng nhập: popup login nhẹ, không redirect
   ▼
Đặt thành công (/booking-success)
   │  Animation vui vẻ
   │  Mã vé + QR code to
   │  [Xem vé của tôi] [Đặt thêm]
```

### 3.5 Luồng người dùng GIA ĐÌNH

```
Trang chủ
   │  [Gói gia đình]
   ▼
Landing Gia Đình (/family)
   │  Giải thích lợi ích (font lớn, icon dễ hiểu)
   │  Ví dụ: "2 người lớn + 2 trẻ em = tiết kiệm 20%"
   │  [Bắt đầu chọn phim]
   ▼
Chọn phim (/family/movies)
   │  Phim lọc sẵn phù hợp gia đình (P/K/T13)
   │  Badge nhãn tuổi to, màu rõ ràng
   │  [chọn phim]
   ▼
Chọn suất chiếu (/family/showtimes?movieId=X)
   │  Date chips ngang
   │  Time slot cards lớn (font to)
   │  [chọn suất]
   ▼
Chọn gói (/family/packages?showtimeId=X)
   │  3 card lớn: gói 2+1 / 2+2 / 1+2
   │  Hiện rõ tổng tiền và tiết kiệm bao nhiêu
   │  [Tiếp tục]
   ▼
Xác nhận ghế (/family/confirm?showtimeId=X&packageId=Y)
   │  Hệ thống TỰ CHỌN ghế liền nhau tốt nhất
   │  Sơ đồ rạp highlight ghế đã chọn
   │  Countdown giữ ghế (10 phút)
   │  [Đổi vị trí khác] [Xác nhận & Thanh toán]
   ▼
Đặt thành công
   │  Ticket card đẹp (style vé vật lý)
   │  QR code to
```

---

## 4. Portal 2 — Cinema Management Web

> Dành cho **CinemaManager**: người quản lý rạp ngày-to-ngày.

### 4.1 Sitemap

```
/manage
├── /manage/login           → Đăng nhập (form riêng)
├── /manage/dashboard       → Tổng quan hôm nay
│   └── Vé bán / Doanh thu / Tỉ lệ ghế / Phim đang chiếu
│
├── /manage/movies          → Quản lý phim
│   ├── Danh sách + search + filter
│   ├── /manage/movies/new  → Thêm phim
│   └── /manage/movies/:id  → Sửa phim
│
├── /manage/halls           → Quản lý phòng chiếu
│   └── Tên phòng, sơ đồ ghế, loại ghế
│
├── /manage/showtimes       → Quản lý suất chiếu
│   ├── Calendar view (xem theo tuần)
│   └── /manage/showtimes/new → Tạo suất chiếu
│
├── /manage/packages        → Gói gia đình
│   └── Bật/tắt gói, sửa % giảm giá
│
├── /manage/bookings        → Tất cả đặt chỗ
│   ├── Filter theo ngày/phim/suất
│   └── /manage/bookings/:id → Chi tiết + trạng thái
│
└── /manage/reports         → Báo cáo
    ├── Doanh thu theo ngày/tuần/tháng
    ├── Phim bán chạy
    └── Tỉ lệ lấp đầy theo phòng
```

### 4.2 Tính năng nổi bật

- **Quét QR:** Nhân viên dùng camera điện thoại scan vé → hiện kết quả ngay
- **Calendar suất chiếu:** Kéo-thả để tạo/dời suất
- **Cảnh báo xung đột:** Tự phát hiện 2 suất trùng phòng/giờ

---

## 5. Portal 3 — System Admin Web

> Dành cho **SysAdmin**: quản lý toàn bộ nền tảng.

### 5.1 Sitemap

```
/admin
├── /admin/login
├── /admin/dashboard        → KPIs toàn hệ thống
│
├── /admin/cinemas          → Quản lý rạp
│   ├── Thêm/sửa/xóa rạp
│   └── Gán CinemaManager cho rạp
│
├── /admin/users            → Tất cả người dùng
│   ├── Search, filter theo role
│   ├── Khoá/mở tài khoản
│   └── Reset mật khẩu
│
├── /admin/roles            → Phân quyền
│   └── Gán role cho user
│
└── /admin/settings         → Cài đặt hệ thống
    ├── Hệ số giá trẻ em (0.7)
    ├── Thời gian giữ ghế Pending (10 phút)
    └── Thông báo hệ thống
```

---

## 6. Nguyên Tắc Chung Toàn Hệ Thống

### Bảo mật
- JWT ngắn hạn (Customer: 24h, Manager: 8h, Admin: 4h)
- Refresh token cho Customer (để không bị log out giữa chừng)
- HTTPS bắt buộc production
- Rate limiting: max 5 lần login sai → lock 15 phút

### Không có quảng cáo
- **Customer Web:** Zero ads. Doanh thu = phí dịch vụ tích hợp vào giá vé.
- Không tracking pixel của bên thứ 3
- Không push notification spam

### Accessibility
- Tất cả button có aria-label
- Contrast ratio ≥ 4.5:1 (dark theme mặc định đáp ứng)
- Font tối thiểu 16px, gia đình flow: 18–20px

---

## 7. Thứ Tự Implement

```
Phase 1 (đang làm): Customer Web — core flow
  ✓ Auth (login/register)
  ✓ Movie list/detail
  ✓ Regular seat picker
  ✓ Family booking flow
  ✗ /profile, /my-tickets/:id với QR
  ✗ /family landing page
  ✗ Dark theme redesign (theo ảnh tham khảo)

Phase 2: Customer Web — polish
  - Dark theme toàn bộ
  - Date chip picker
  - Seat icon thay ô vuông
  - Sticky bottom CTA
  - QR code display

Phase 3: Cinema Management Web
  - Dashboard + Movies + Showtimes
  - QR scanner
  - Reports cơ bản

Phase 4: System Admin Web
  - User management
  - Cinema management
  - Settings
```

---

## 8. Những Gì Nằm Ngoài Phạm Vi (YAGNI)

- Thanh toán thật (VNPay/Momo) → mock "Đặt thành công" trước
- Combo đồ ăn → Phase 5+
- App native (iOS/Android) → PWA đủ dùng trước
- Đa ngôn ngữ → tiếng Việt trước
- Loyalty points / tích điểm → Phase 5+
