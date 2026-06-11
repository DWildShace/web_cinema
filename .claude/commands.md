# Development Commands

## Frontend (`frontend/`)

```bash
bun install          # Install dependencies
bun run dev          # Start Vite dev server → http://localhost:5173
bun run build        # Production build
bun run lint         # ESLint
```

## Backend (`backend/`)

```bash
dotnet restore                          # Restore NuGet packages
dotnet build                            # Build all projects
dotnet run --project CinemaBooking.API  # Start API → http://localhost:5000
dotnet test                             # Run all tests
dotnet test --filter "FullyQualifiedName~ServiceName"  # Run single test class
```

## EF Core Migrations (run from `backend/`)

```bash
dotnet ef migrations add <Name> --project CinemaBooking.DAL --startup-project CinemaBooking.API
dotnet ef database update              --project CinemaBooking.DAL --startup-project CinemaBooking.API
dotnet ef database drop                --project CinemaBooking.DAL --startup-project CinemaBooking.API  # destructive
```

## PostgreSQL (Docker)

```bash
docker compose up -d                    # Start container (postgres_cinema, port 5433)
docker compose down                     # Stop container
docker logs cinema_postgres             # View logs
docker exec -it cinema_postgres psql -U root -d cinema  # psql shell
```
