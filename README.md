# Web Cinema

A premium, modern web-based movie ticket booking system. It features a responsive React frontend and a robust ASP.NET Core backend, backed by PostgreSQL running in a Docker container.

## 🚀 Key Features

- **Movie Exploration**: Browse current and upcoming movies with rich details, genres, duration, and ratings.
- **Seat Booking System**: Interactive, real-time seat map layouts (Standard vs. VIP seats) for scheduling halls.
- **Authentication & Security**: Secure user accounts, roles (Customer, Admin), and JWT-based authentication.
- **Ticket Generation**: Book seats for showtimes and generate tickets with unique QR codes.
- **Admin Dashboard**: Manage movies, halls, showtimes, and view booking metrics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite & Bun
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand / React Context

### Backend
- **Framework**: ASP.NET Core 8 Web API (MVC Pattern)
- **Database**: PostgreSQL 16
- **ORM**: Entity Framework Core 8 (Code-First)
- **Security**: JWT Bearer Tokens

---

## 📁 Repository Structure

```text
web_cinema/
├── frontend/          # React + Vite + Bun + Tailwind CSS
└── backend/           # ASP.NET Core Web API (3-layer + MVC)
    ├── CinemaBooking.API/      # Presentation layer (Controllers, Middlewares)
    ├── CinemaBooking.BLL/      # Business Logic Layer (Services, DTOs)
    ├── CinemaBooking.DAL/      # Data Access Layer (EF Core DbContext, Repositories, Migrations)
    └── CinemaBooking.Domain/   # Domain Models & Entities
```

---

## 🚦 Getting Started

Please refer to the developer guidelines in [CLAUDE.md](CLAUDE.md) for full commands on installing dependencies, running the frontend/backend servers locally, and managing database migrations.
