# RedBanck API — Documentación

Base URL: `http://localhost:8080/api`
Documentación interactiva (Swagger UI): `http://localhost:8080/api/docs`
Especificación OpenAPI: `http://localhost:8080/api/v3/api-docs`

## Autenticación

Esquema: JWT Bearer. El **access token** expira en 15 minutos; el **refresh token**
(opaco, almacenado en BD) dura 7 días y **se rota en cada uso** — si se detecta el
reuso de un refresh token ya rotado, se revocan todas las sesiones del usuario.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro. Crea cuenta inicial con bono de bienvenida (S/ 100). Devuelve tokens. |
| POST | `/auth/login` | Login con `documentId` + `password`. |
| POST | `/auth/refresh` | Renueva la sesión (`{ "refreshToken": "..." }`). |
| POST | `/auth/logout` | Revoca el refresh token. |
| GET | `/users/me` | Perfil del usuario autenticado. |

### Restricciones de login

- Tras **5 intentos fallidos** consecutivos el usuario queda bloqueado **15 minutos** (HTTP `423 Locked`).
- Usuarios bloqueados por un administrador reciben `403` y sus sesiones se revocan.
- Credenciales incorrectas devuelven siempre el mismo mensaje genérico (`401`) para evitar enumeración de usuarios.

### Ejemplo

```http
POST /api/auth/login
Content-Type: application/json

{ "documentId": "12345678", "password": "secreta123" }
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "9f86d081884c7d65...",
  "expiresIn": 900,
  "user": { "id": "…", "email": "…", "firstName": "…", "lastName": "…", "role": "USER" }
}
```

## Cuentas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/accounts` | Cuentas del usuario. |
| GET | `/accounts/{id}` | Detalle de una cuenta propia. |
| POST | `/accounts` | Abrir cuenta: `{ "alias": "...", "type": "SAVINGS" \| "CHECKING" }`. Máx. 5 activas. |

## Transferencias

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/transfers` | `{ sourceAccountId, destinationAccountNumber (14 dígitos), amount, description? }` |

Validaciones: saldo suficiente, cuenta destino activa, y límites del usuario
(por operación / diario / mensual). La operación es atómica con bloqueo pesimista
de ambas cuentas en orden determinista.

## Movimientos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/transactions` | Paginado. Filtros: `accountId`, `type` (`DEPOSIT`\|`TRANSFER_IN`\|`TRANSFER_OUT`), `from`, `to` (ISO date), `page`, `size`. |

## Tarjetas virtuales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/cards` | Listado con número enmascarado. |
| POST | `/cards` | Genera tarjeta (PAN válido Luhn). Máx. 3 activas por cuenta. |
| PATCH | `/cards/{id}/block` · `/unblock` | Bloqueo/desbloqueo. |
| POST | `/cards/{id}/reveal` | Devuelve PAN + CVV. Exige `{ "password": "..." }`. |

## Límites de operación

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/limits` | Límites vigentes + topes del banco. |
| PUT | `/limits` | Actualiza `maxPerTransfer`, `dailyTransferLimit`, `monthlyTransferLimit`. |

Topes: S/ 10,000 por transferencia · S/ 30,000 diario · S/ 200,000 mensual.
Defaults: S/ 5,000 · S/ 10,000 · S/ 50,000.

## Administración (rol ADMIN)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/users` | Usuarios paginados. |
| PATCH | `/admin/users/{id}/block` · `/unblock` | Bloqueo administrativo (revoca sesiones). |
| GET | `/admin/metrics` | Usuarios, cuentas, saldo total, transferencias y volumen del día. |

Admin inicial (seed): documento `00000000`, contraseña `Admin123!` (configurable vía `ADMIN_PASSWORD`).

## Formato de errores

```json
{
  "timestamp": "2026-07-16T15:00:00Z",
  "status": 400,
  "message": "Saldo insuficiente",
  "fieldErrors": { "amount": "El monto mínimo es S/ 0.01" }
}
```

## Ejecución

```bash
# Todo con Docker (API + PostgreSQL)
cd infra/docker && docker compose up --build

# Solo la base de datos (API en local con Maven)
docker compose up db -d
# El contenedor publica PostgreSQL en el puerto 5433 del host
# (el 5432 suele estar ocupado por el PostgreSQL de WSL)
cd backend
DB_URL=jdbc:postgresql://localhost:5433/redbanck mvn spring-boot:run
```

Variables de entorno relevantes: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`,
`ACCESS_TOKEN_MINUTES`, `REFRESH_TOKEN_DAYS`, `CORS_ORIGINS`, `ADMIN_PASSWORD`.
