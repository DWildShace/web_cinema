# Architecture

## Backend: 3-Layer + MVC

**Request flow:** Controller (API) → Service (BLL) → Repository (DAL) → EF Core → PostgreSQL

```
backend/
├── CinemaBooking.API/     # Controllers, middleware, Program.cs, DI setup
├── CinemaBooking.BLL/     # Services, DTOs, AutoMapper profiles, business rules
├── CinemaBooking.DAL/     # AppDbContext, repositories, EF fluent config, migrations
└── CinemaBooking.Domain/  # Plain C# entity classes — no EF attributes, no project references
```

**Dependency rule (enforced):** API → BLL → DAL → Domain. Controllers reference BLL only; DAL is never imported by API directly.

**Conventions:**
- Entity configuration: fluent API in DAL (no data annotations on Domain entities)
- Every service has an interface in BLL; repositories have interfaces in DAL
- DTOs live in BLL alongside the service that uses them
- AutoMapper profiles map Domain ↔ DTO inside BLL

## Frontend: Feature-based

```
frontend/src/
├── api/        # Axios instances + per-domain API functions
├── components/ # Shared UI components
├── features/   # One folder per domain (movies, booking, auth, seats)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── hooks/      # Global custom hooks
├── store/      # Zustand stores
└── types/      # TypeScript types mirroring backend DTOs
```

State management: **Zustand** for global state. React Context only for theme/locale concerns.
