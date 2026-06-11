# Family Booking Feature — Design Spec
**Date:** 2026-06-11
**Status:** Approved

---

## 1. Bối cảnh & Mục tiêu

Dự án nhắm tới nhóm **gia đình / người trung niên** — nhóm bị bỏ quên bởi CGV/Lotte do UI rối và thiếu hướng dẫn. Tính năng đặt vé gia đình giải quyết hai nỗi đau chính:

- Phải quyết định quá nhiều thứ (vé lẻ từng người, chọn ghế thủ công, tính giá)
- Dễ bị tách ghế khi đặt muộn hoặc đặt cho nhóm đông

**Phạm vi MVP:** Gói giá gia đình (2) + Tự động chọn ghế liền nhau (3).

---

## 2. Luồng Người Dùng

Trang chủ có 2 lối vào riêng biệt: **"Đặt vé thường"** và **"Đặt vé gia đình"**.

Luồng gia đình gồm 3 bước — mỗi bước chỉ có 1 quyết định thật:

```
[1] Chọn phim
      Danh sách phim lọc sẵn (AgeRating ∈ P/K/T13 lên trên)
      Hiển thị nhãn phân loại rõ ràng trên mỗi poster
        │
        ▼
[2] Chọn gói + suất chiếu
      3 card lớn, dễ bấm:
        ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
        │  2 NL + 1 TE│  │  2 NL + 2 TE│  │  1 NL + 2 TE│
        │  270.000đ   │  │  320.000đ   │  │  220.000đ   │
        └─────────────┘  └─────────────┘  └─────────────┘
      Chọn ngày + suất chiếu
        │
        ▼
[3] Xác nhận ghế (tự động)
      Hệ thống tự tìm ghế liền nhau tốt nhất
      Hiển thị sơ đồ rạp, highlight ghế đã chọn
      Nút [Đổi vị trí khác] nếu muốn
      Countdown giữ ghế 10 phút
        │
        ▼
[4] Thanh toán → QR code
```

---

## 3. Data Model

### Entity mới: `FamilyPackage`

| Field | Type | Mô tả |
|-------|------|-------|
| Id | int | PK |
| Name | string | "Gói 2+1", "Gói 2+2", "Gói 1+2" |
| AdultCount | int | Số người lớn trong gói |
| ChildCount | int | Số trẻ em trong gói |
| DiscountPct | decimal | % giảm so với tổng giá lẻ |
| IsActive | bool | Admin bật/tắt gói |

**Công thức giá:**
```
TotalPrice = Showtime.Price × (AdultCount + ChildCount × 0.7) × (1 - DiscountPct)
```
Hệ số trẻ em (0.7) là cấu hình, có thể điều chỉnh.

### Sửa `Booking`

Thêm cột nullable:

| Field | Type | Mô tả |
|-------|------|-------|
| FamilyPackageId | int? | null = đặt lẻ; có giá trị = đặt gói gia đình |

### Sửa `Movie`

Thêm cột:

| Field | Type | Giá trị |
|-------|------|---------|
| AgeRating | enum | P \| K \| T13 \| T16 \| T18 |

### Migrations cần tạo
1. Tạo bảng `FamilyPackages`
2. Thêm cột `FamilyPackageId` (nullable FK) vào `Bookings`
3. Thêm cột `AgeRating` vào `Movies`

---

## 4. Thuật Toán Tự Động Chọn Ghế

**Input:** `showtimeId`, `seatCount` = AdultCount + ChildCount
**Output:** danh sách ghế liền nhau tốt nhất, hoặc fallback

### Bước 1 — Lọc ghế khả dụng
Loại bỏ ghế có `BookingSeat.Status ∈ {Pending, Confirmed}`.

### Bước 2 — Tìm chuỗi N ghế liền nhau
Với mỗi hàng, quét các chuỗi ghế Available liên tiếp. Lưu tất cả chuỗi có độ dài ≥ N.

### Bước 3 — Chấm điểm
| Tiêu chí | Điểm |
|----------|------|
| Hàng thuộc 30–60% giữa tổng số hàng | +30 |
| Nhóm ghế nằm trong 60% cột giữa | +20 |
| Không sát cột đầu hoặc cuối | +10 |

Chọn nhóm điểm cao nhất.

### Bước 4 — Fallback
- **Không đủ N ghế cùng hàng:** Thử ghép 2 chuỗi hàng kế nhau (vd: 2+2). Hiển thị cảnh báo rõ ràng.
- **Vẫn không đủ:** Gợi ý 2–3 suất chiếu khác còn đủ ghế liền nhau.

### Concurrency
Khi người dùng vào màn hình xác nhận ghế, tạo `BookingSeat` với:
- `Status = Pending`
- `ExpiresAt = now + 10 phút`

Cần xây **background service** (`SeatExpiryService`) chạy mỗi 1 phút, tự động set `Status = Available` cho các `BookingSeat` có `Status = Pending` và `ExpiresAt < now`. Đây là component mới, chưa có trong codebase.

---

## 5. API Endpoints

### Quản lý gói (Admin)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/family-packages` | Lấy danh sách gói active |
| POST | `/api/family-packages` | Tạo gói mới |
| PUT | `/api/family-packages/{id}` | Sửa gói |
| DELETE | `/api/family-packages/{id}` | Ẩn gói |

### Luồng đặt vé gia đình
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/movies/family-friendly` | Phim phù hợp (P/K/T13), sắp xếp ưu tiên |
| GET | `/api/showtimes/{id}/family-packages` | Gói + giá đã tính cho suất chiếu |
| POST | `/api/showtimes/{id}/seats/suggest` | Gợi ý ghế, lock Pending 10 phút |
| POST | `/api/bookings/family` | Tạo booking gia đình |

**Tổng: 8 endpoints mới.** Các endpoint hiện có giữ nguyên, không bị ảnh hưởng.

---

## 6. Frontend Components

Nằm trong `frontend/src/features/family-booking/`:

```
features/family-booking/
├── pages/
│   ├── FamilyMovieListPage        Chọn phim (lọc sẵn phù hợp gia đình)
│   ├── FamilyPackagePickerPage    Chọn gói + suất chiếu
│   └── FamilyConfirmPage          Xác nhận ghế + thanh toán
├── components/
│   ├── FamilyPackageCard          Card gói lớn, font lớn, tap target ≥ 56px
│   ├── SeatMapPreview             Sơ đồ rạp, highlight ghế tự chọn
│   ├── FallbackShowtimeSuggest    Hiện khi không đủ ghế liền nhau
│   └── AgeRatingBadge             Nhãn P / K / T13 trên poster
└── hooks/
    ├── useFamilyPackages          Fetch gói theo showtimeId
    └── useSuggestSeats            Gọi /seats/suggest, quản lý countdown
```

### UX đặc biệt cho người lớn tuổi
- `FamilyPackageCard`: font lớn hơn 20%, tap target tối thiểu 56px, chỉ hiển thị thông tin cần thiết
- `useSuggestSeats`: countdown hiển thị rõ "Ghế được giữ trong X:XX"; khi hết giờ hiện toast thông báo rõ ràng, không im lặng thất bại

---

## 7. Những gì nằm ngoài phạm vi MVP này

- Combo đồ ăn (Feature 5) — thêm sau
- Tài khoản gia đình / profile (Feature 6) — thêm sau
- Chính sách hủy/đổi vé linh hoạt (Feature 8) — thêm sau
- Thanh toán thật (VNPay, Momo) — dùng mock trước
