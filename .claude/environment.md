# Environment & Configuration

## File structure

| File | Tracked | Purpose |
|------|---------|---------|
| `.env` | No (gitignored) | Local dev credentials |
| `.env.example` | Yes | Template — copy to `.env` to get started |
| `frontend/.env.local` | No (gitignored) | Frontend env vars |
| `frontend/.env.example` | Yes | Template for frontend |

## Local dev values (Docker)

| Variable | Value |
|----------|-------|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5433` |
| `DB_NAME` | `cinema` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `12345678` |
| `VITE_API_BASE_URL` | `http://localhost:5000` |

## Backend: appsettings.Development.json

`backend/CinemaBooking.API/appsettings.Development.json` is gitignored. Create it manually:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=cinema;Username=root;Password=12345678"
  },
  "Jwt": {
    "Secret": "change-this-to-a-long-random-secret-in-production",
    "Issuer": "CinemaBooking",
    "Audience": "CinemaBooking"
  }
}
```

Alternatively use `dotnet user-secrets`:
```bash
cd backend/CinemaBooking.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=cinema;Username=root;Password=12345678"
dotnet user-secrets set "Jwt:Secret" "your-secret"
```
