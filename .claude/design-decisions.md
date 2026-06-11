# Key Design Decisions

- **No EF attributes on Domain entities** — all mapping config lives in `CinemaBooking.DAL` using `IEntityTypeConfiguration<T>`.
- **Repository pattern** — DAL exposes `IRepository<T>` or domain-specific repos; BLL never calls `DbContext` directly.
- **JWT auth** — issued on login, validated via ASP.NET Core middleware. Role claims drive `[Authorize(Roles="Admin")]` guards.
- **Seat concurrency** — seats are set to `Pending` status on selection; a background job or expiry check releases them if the booking flow is abandoned.
