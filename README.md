# RedBanck — Plataforma Bancaria Digital

Neobanco full-stack: registro y autenticación segura, cuentas bancarias, transferencias entre usuarios, historial de movimientos, tarjetas virtuales, límites de operación y panel administrativo.

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green) ![React](https://img.shields.io/badge/React-19-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

## Arquitectura

```
├── backend/    → API REST · Spring Boot 3.4 · Spring Security · JWT · JPA
├── frontend/   → SPA · React 19 · TypeScript · Vite · Tailwind · Zustand
├── infra/      → Docker Compose (PostgreSQL 16 + API)
└── docs/       → Documentación de la API y arquitectura
```

## Características de seguridad

- **JWT access tokens** (HS256, 15 min) + **refresh tokens con rotación** y detección de reuso (revoca todas las sesiones ante un posible robo)
- **Bloqueo temporal** tras 5 intentos de login fallidos (15 min)
- Contraseñas con **BCrypt**; mensajes de error genéricos anti-enumeración
- Revelar datos de tarjeta exige reconfirmar la contraseña
- Transferencias atómicas con bloqueo pesimista y validación de límites (por operación / diario / mensual)
- Control de acceso por roles (`USER` / `ADMIN`)

## Ejecución rápida

```bash
# Todo con Docker (API + PostgreSQL)
cd infra/docker
docker compose up --build
```

```bash
# Frontend
cd frontend/web
npm install
npm run dev        # http://localhost:3000
```

La API queda en `http://localhost:8080/api` — documentación interactiva (Swagger UI) en `http://localhost:8080/api/docs`.

> Si el puerto 5432 está ocupado en tu máquina, el contenedor de PostgreSQL publica en el **5433**; para correr la API fuera de Docker: `DB_URL=jdbc:postgresql://localhost:5433/redbanck`.

**Usuario administrador inicial** (solo desarrollo — cambiar en producción vía variables de entorno): documento `00000000`, contraseña `Admin123!`.

## Documentación

- [Referencia de la API](docs/api/README.md) — endpoints, restricciones de login, formato de errores
- Especificación OpenAPI: `GET /api/v3/api-docs`

## Variables de entorno

| Variable | Descripción | Default (dev) |
|---|---|---|
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | Conexión PostgreSQL | `localhost:5432/redbanck` |
| `JWT_SECRET` | Clave HMAC de los access tokens | *(placeholder, cambiar)* |
| `ACCESS_TOKEN_MINUTES` / `REFRESH_TOKEN_DAYS` | Vigencia de tokens | 15 / 7 |
| `ADMIN_PASSWORD` | Contraseña del admin seed | `Admin123!` |
| `CORS_ORIGINS` | Orígenes permitidos | `localhost:3000/3001/5173` |
| `VITE_API_URL` (frontend) | URL base de la API | `http://localhost:8080/api` |
