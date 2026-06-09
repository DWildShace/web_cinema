# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based movie ticket booking system with a React frontend and ASP.NET Core backend, backed by PostgreSQL running in a Docker container on a Debian VM.

## Repository Structure

```
/
├── frontend/          # React + Vite + Bun + Tailwind CSS
└── backend/           # ASP.NET Core Web API (3-layer + MVC)
    ├── CinemaBooking.API/           # Presentation layer (Controllers, Middlewares)
    ├── CinemaBooking.BLL/           # Business Logic Layer (Services, DTOs)
    ├── CinemaBooking.DAL/           # Data Access Layer (Repositories, EF Core DbContext, Migrations)
    └── CinemaBooking.Domain/        # Domain models / Entities
```

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Bun, Tailwind CSS v4            |
| Backend    | ASP.NET Core 8 Web API, MVC pattern             |
| ORM        | Entity Framework Core 8 (Code-First)            |
| Database   | PostgreSQL 16 (Docker container on Debian VM)   |
| Auth       | JWT Bearer tokens                               |

## Development Commands

### Frontend (`frontend/`)

```bash
bun install          # Install dependencies
bun run dev          # Start Vite dev server (default: http://localhost:5173)
bun run build        # Production build
bun run lint         # ESLint
bun run preview      # Preview production build
```

### Backend (`backend/`)

```bash
dotnet restore                          # Restore NuGet packages
dotnet build                            # Build all projects
dotnet run --project CinemaBooking.API  # Start API server (default: http://localhost:5000)
dotnet test                             # Run all tests
dotnet test --filter "FullyQualifiedName~ServiceName"  # Run a single test class
```

### Database Migrations (run from `backend/`)

```bash
dotnet ef migrations add <MigrationName> --project CinemaBooking.DAL --startup-project CinemaBooking.API
dotnet ef database update --project CinemaBooking.DAL --startup-project CinemaBooking.API
dotnet ef database drop --project CinemaBooking.DAL --startup-project CinemaBooking.API   # destructive
```

### PostgreSQL on Debian VM (Docker)

```bash
# Connect to the Debian VM first, then:
docker compose up -d          # Start PostgreSQL container
docker compose down           # Stop container
docker logs cinema_postgres   # View DB logs
docker exec -it cinema_postgres psql -U postgres -d cinema_booking  # psql shell
```

## Architecture

### Backend: 3-Layer + MVC

**Flow:** HTTP Request → Controller (API layer) → Service (BLL) → Repository (DAL) → EF Core → PostgreSQL

- **`CinemaBooking.Domain`** — Plain C# entity classes only. No EF Core attributes; fluent config lives in DAL. No project references.
- **`CinemaBooking.DAL`** — `AppDbContext`, repository interfaces + implementations, EF Core fluent configurations, migrations. References Domain.
- **`CinemaBooking.BLL`** — Service interfaces + implementations, DTOs, AutoMapper profiles, business rules. References DAL and Domain.
- **`CinemaBooking.API`** — ASP.NET Core controllers, middleware, DI registration, `Program.cs`. References BLL only (never DAL directly from controllers).

**Dependency rule:** API → BLL → DAL → Domain. No upward or cross-layer references.

### Frontend: Feature-based structure

```
frontend/src/
├── api/           # Axios instances and API call functions per domain
├── components/    # Shared/reusable UI components
├── features/      # Feature folders (movies, booking, auth, seats)
│   └── booking/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── hooks/         # Global custom hooks
├── store/         # Zustand or Context state
└── types/         # Shared TypeScript types mirroring backend DTOs
```

### Database Connection

The PostgreSQL instance runs inside a Docker container on a Debian VM. The connection string in `appsettings.Development.json` must target the VM's IP (or hostname) and the mapped host port:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=<DEBIAN_VM_IP>;Port=5432;Database=cinema_booking;Username=postgres;Password=<password>"
}
```

Never commit real credentials. Use `dotnet user-secrets` locally or environment variables in production.

## Key Domain Concepts

- **Movie** — title, genre, duration, poster, rating
- **Cinema / Hall** — cinema location contains multiple screening halls with seat layouts
- **Showtime** — a scheduled screening of a Movie in a Hall at a datetime
- **Seat** — belongs to a Hall; has row/column and type (standard/vip)
- **Booking** — one User books one or more Seats for one Showtime; generates a QR/ticket code
- **User** — authenticated via JWT; roles: Customer, Admin

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_BASE_URL` | `frontend/.env.local` | Backend API base URL |
| `ConnectionStrings__DefaultConnection` | backend env / user-secrets | PostgreSQL connection |
| `Jwt__Secret` | backend env / user-secrets | JWT signing key |
| `Jwt__Issuer` / `Jwt__Audience` | backend env / user-secrets | JWT claims |
