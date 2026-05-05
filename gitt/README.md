# GITT — Gestión de Inventario Tecnológico

Sistema web para administrar el inventario tecnológico de la **FISEI - Universidad Técnica de Ambato**.

## Stack

- **Backend:** Node.js 20+ · Express · Sequelize + oracledb · JWT · Winston · Swagger · node-cron
- **Frontend:** React 18 · Vite · Tailwind CSS · TanStack Table · Zustand · Recharts · React Hook Form + Zod
- **Base de datos:** Oracle 19c / 21c (esquema `GITT_SCHEMA`)

## Estructura

```
gitt/
├── database/
│   ├── schema.sql      # DDL Oracle: tablas, secuencias, triggers, FKs
│   └── seed.sql        # Semilla SQL alternativa (fallback)
├── backend/
│   ├── src/
│   │   ├── config/      # database, jwt, swagger
│   │   ├── models/      # 14 modelos Sequelize + index con asociaciones
│   │   ├── controllers/ # auth, articulo, prestamo, mantenimiento, ...
│   │   ├── services/    # lógica de negocio + transacciones
│   │   ├── routes/      # auth, articulos, prestamos, ...
│   │   ├── middlewares/ # auth, role, audit, validate, error
│   │   ├── validators/  # Joi schemas
│   │   ├── utils/       # logger, response, pagination, constants
│   │   ├── seeders/seed.js
│   │   ├── jobs/        # cron de préstamos vencidos
│   │   └── app.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/         # axios + módulos por recurso
    │   ├── components/  # layout, ui, forms
    │   ├── pages/       # Dashboard, Inventario, Préstamos, ...
    │   ├── store/       # Zustand (auth, notificaciones)
    │   ├── router/      # AppRouter + ProtectedRoute
    │   └── utils/
    └── package.json
```

## Requisitos

- Node.js 20+ y npm
- Oracle Database 19c/21c (XE o superior). Para desarrollo local, **Oracle XE 21c** funciona perfecto.
- Cliente Oracle Instant Client (necesario para `oracledb`).
- Git

## Instalación paso a paso

### 1. Preparar la base de datos Oracle

Crea el esquema y ejecuta el script DDL:

```sql
-- Conectado como SYSDBA
CREATE USER GITT_SCHEMA IDENTIFIED BY GittPass2024;
GRANT CONNECT, RESOURCE, DBA TO GITT_SCHEMA;
ALTER USER GITT_SCHEMA QUOTA UNLIMITED ON USERS;
```

Conéctate ahora como `GITT_SCHEMA` y ejecuta el script:

```bash
sqlplus GITT_SCHEMA/GittPass2024@localhost:1521/XEPDB1 @database/schema.sql
```

> El script crea las 14 tablas, sus 14 secuencias, los triggers `BEFORE INSERT` para auto-incremento, el trigger crítico **TRG_PRESTAMO_ACTIVO** (regla de negocio: un artículo no puede estar en dos préstamos activos), los triggers de auditoría e índices de rendimiento.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales Oracle
npm install
npm run seed      # Crea roles, estados, categorías, ubicaciones y el usuario admin
npm run dev       # Levanta en http://localhost:3001
```

Documentación Swagger: <http://localhost:3001/api/docs>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # Levanta en http://localhost:5173
```

### 4. Acceso

- URL: <http://localhost:5173>
- Usuario admin: `admin@fisei.uta.edu.ec`
- Contraseña: `Admin2024!`

## Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del backend | `3001` |
| `API_PREFIX` | Prefijo de la API | `/api/v1` |
| `CORS_ORIGIN` | Origen permitido para el frontend | `http://localhost:5173` |
| `ORACLE_USER` | Usuario Oracle | `GITT_SCHEMA` |
| `ORACLE_PASSWORD` | Contraseña Oracle | `GittPass2024` |
| `ORACLE_CONNECT_STRING` | Cadena de conexión | `localhost:1521/XEPDB1` |
| `JWT_SECRET` | Secreto JWT (mínimo 256 bits) | _genera uno seguro_ |
| `JWT_EXPIRES_IN` | Duración del token | `8h` |
| `BCRYPT_ROUNDS` | Coste bcrypt | `12` |
| `CRON_PRESTAMOS_VENCIDOS` | Cron del job diario | `0 8 * * *` |

## Roles y permisos

| Rol | ID | Permisos |
|---|---|---|
| **ADMINISTRADOR** | 1 | Acceso total: CRUD de artículos, préstamos, mantenimientos, usuarios, auditoría, reportes |
| **DOCENTE** | 2 | Lectura del inventario, crear/devolver préstamos, ver mantenimientos |
| **ESTUDIANTE** | 3 | Lectura del inventario y de sus propios préstamos |

El RBAC se valida **siempre en backend** (`role.middleware.js`); el frontend lo respeta como UX.

## Endpoints principales (`/api/v1`)

```
POST   /auth/login                 → { correo, password } → { token, usuario }
POST   /auth/logout
GET    /auth/me
PUT    /auth/change-password

GET    /articulos                  ?page&limit&search&categoria&estado&ubicacion
GET    /articulos/:id
POST   /articulos                  [ADMIN]
PUT    /articulos/:id              [ADMIN]
DELETE /articulos/:id              [ADMIN]  (eliminación lógica)
GET    /articulos/:id/historial
GET    /articulos/:id/mantenimientos

GET    /prestamos                  ?page&limit&estado&responsable
POST   /prestamos                  [ADMIN, DOCENTE]
PUT    /prestamos/:id/devolver
PUT    /prestamos/:id/cancelar     [ADMIN]
GET    /prestamos/vencidos

GET    /mantenimientos
POST   /mantenimientos             [ADMIN]
PUT    /mantenimientos/:id

GET    /movimientos
POST   /movimientos                [ADMIN]
GET    /movimientos/articulo/:id

GET    /notificaciones
GET    /notificaciones/pendientes
PUT    /notificaciones/:id/leer
DELETE /notificaciones/:id

GET    /reportes/dashboard
GET    /reportes/inventario        [ADMIN]
GET    /reportes/prestamos-activos [ADMIN]
GET    /reportes/mantenimientos    [ADMIN]

GET    /auditoria                  [ADMIN]

GET    /roles, /categorias, /estados, /departamentos, /ubicaciones, /responsables
GET    /usuarios                   [ADMIN]
```

## Reglas de negocio críticas

1. **Préstamo único activo por artículo** — Triple defensa:
   - Validación en `prestamo.service.js` antes de insertar.
   - Trigger Oracle `TRG_PRESTAMO_ACTIVO` (RAISE_APPLICATION_ERROR -20001) garantiza la regla aún si alguien escribe directo en BD.
   - Cambio de estado del artículo a `PRESTADO` en la misma transacción.

2. **Toda operación multi-tabla en transacción** — Préstamo, devolución, cancelación, mantenimiento y traslado usan `sequelize.transaction()`.

3. **Auditoría automática** — Triggers `TRG_AUD_ARTICULO`, `TRG_AUD_PRESTAMO`, `TRG_AUD_MANTENIMIENTO` registran INSERT/UPDATE/DELETE en la tabla `AUDITORIA`. Adicionalmente, `audit.middleware.js` registra IP y endpoint llamado por el usuario autenticado.

4. **Préstamos vencidos** — Job `node-cron` (configurable, por defecto 8:00 AM diario) marca como `VENCIDO` y genera notificación.

5. **Movimientos automáticos** — Cada cambio de estado/ubicación de artículo genera un registro en `MOVIMIENTO` para mantener la trazabilidad histórica completa.

## Seguridad

- Contraseñas: **bcrypt** con 12 rounds.
- JWT firmado HS256 con expiración de 8h.
- Rate limit (10 intentos / 15 min) en `/auth/login`.
- Helmet + CORS restringido.
- SQL injection: parámetros parametrizados (Sequelize) + binds del driver oracledb.
- Validación de entrada con Joi.
- Sin `console.log` en producción (Winston con rotación a `logs/`).

## Comandos

### Backend

```bash
npm run dev       # Desarrollo con nodemon
npm start         # Producción
npm run seed      # Reinsertar datos semilla
npm test          # Jest + Supertest
```

### Frontend

```bash
npm run dev       # Vite dev server
npm run build     # Build de producción
npm run preview   # Vista previa del build
```

## Troubleshooting

**`ORA-12541: TNS:no listener`**
El listener de Oracle no está arriba. Reinicia el servicio o ejecuta `lsnrctl start`.

**`ORA-01017: invalid username/password`**
Revisa `ORACLE_USER` y `ORACLE_PASSWORD` en `.env`.

**`NJS-138: connections to this database server version are not supported`**
Actualiza el cliente: `npm i oracledb@latest`.

**Oracle XE no acepta conexiones del backend**
Asegúrate de usar el PDB (`XEPDB1`), no el CDB (`XE`).

## Equipo

Proyecto de la asignatura **Base de Datos** — Carrera de Software, FISEI - UTA · Ciclo Enero - Julio 2026.

- Arcos Guzmán Juan Carlos
- Lara Fernández Andrew Johan
- Solis Salinas Mario Thomas
- Vaca Ramos Freddy Sebastián

Docente: Ing. José Caiza, Mg.

## Licencia

MIT — Uso académico.
