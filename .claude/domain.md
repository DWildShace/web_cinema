# Domain Model

| Entity | Key fields |
|--------|-----------|
| Movie | title, genre, duration, posterUrl, rating |
| Cinema | name, location; contains many Halls |
| Hall | name, rows, columns; belongs to Cinema |
| Seat | row, column, type (Standard/VIP); belongs to Hall |
| Showtime | movieId, hallId, startsAt, price |
| Booking | userId, showtimeId; contains many BookingSeats; has ticketCode (QR) |
| User | email, passwordHash, role (Customer/Admin) |

Seats are marked `Pending` when a user selects them during checkout; released automatically if booking is not completed within a time window.
