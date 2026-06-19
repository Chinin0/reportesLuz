# Arquitectura - Sistema de Reportes de Alumbrado Público

Documentación de decisiones arquitectónicas y patrones técnicos.

## Visión General

Sistema de dos capas:
- **Backend**: API REST Node.js + Express, Base de datos SQLite
- **Frontend**: Interfaz React + Leaflet, Cliente HTTP con Axios

```
┌─────────────────────────────────────────┐
│          NAVEGADOR                       │
│  ┌──────────────────────────────────┐   │
│  │  React App (Vite)                │   │
│  │  - Página de reportes            │   │
│  │  - Panel admin                   │   │
│  │  - Mapas interactivos            │   │
│  └──────────────────────────────────┘   │
└──────────────────────┬────────────────────┘
                       │ HTTP/JSON
                       ↓
        ┌──────────────────────────┐
        │   API Node.js + Express  │
        │  ┌────────────────────┐  │
        │  │ POST /reports      │  │
        │  │ GET  /reports      │  │
        │  │ PATCH /reports/:id │  │
        │  │ POST /auth/login   │  │
        │  └────────────────────┘  │
        └────────────┬─────────────┘
                     │ SQL
                     ↓
            ┌─────────────────┐
            │  SQLite DB      │
            │  reports.db     │
            └─────────────────┘
```

## Backend

### Stack Tecnológico

- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Base de Datos**: SQLite3 (desarrollo/MVP)
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: express-validator
- **Seguridad**: helmet, bcryptjs
- **HTTP Client**: axios (para reverse geocoding)

### Estructura de Capas

```
routes (express routes)
   ↓
controllers (request handling)
   ↓
models (business logic, DB queries)
   ↓
config (database connection)
```

### Decisiones Clave

#### 1. SQLite para MVP
- ✅ Sin servidor externo requerido
- ✅ Archivo único (`reports.db`)
- ✅ Suficiente para MVP
- ⚠️ Escalabilidad limitada
- **Migración**: Cambiar `config/database.js` para PostgreSQL

#### 2. JWT para Admin
- ✅ Sin estado (stateless)
- ✅ Simple de implementar
- ✅ Escalable
- ⚠️ Token hardcodeado en .env para MVP
- **Mejora**: Tabla `users` con bcrypt en producción

#### 3. Express con Middleware
- ✅ Flexible
- ✅ Comunidad grande
- ✅ Fácil de testear
- Error handling centralizado
- CORS permitiendo frontend

#### 4. Validaciones en Servidor
- `express-validator` para validar input
- Prepared statements para prevenir SQL injection
- No confiar en cliente

### Endpoints API

**Base**: `/api`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /reports | ❌ | Crear reporte |
| GET | /reports | ❌ | Listar reportes (paginado) |
| GET | /reports/:id | ❌ | Obtener detalle |
| PATCH | /reports/:id | ✅ | Actualizar reporte |
| DELETE | /reports/:id | ✅ | Eliminar reporte |
| GET | /stats | ✅ | Estadísticas |
| POST | /auth/login | ❌ | Login admin |

### Modelos de Datos

**Tabla: reports**
```sql
id (PK)
latitude, longitude (ubicación)
address (obtenida automáticamente)
problem_type (apagado, parpadea, danado, otro)
description, photo_url
reporter_name, reporter_email, reporter_phone
status (pendiente, asignado, en_progreso, resuelto, rechazado)
priority (baja, media, alta)
admin_notes, assigned_to, assigned_date
created_at, updated_at, resolved_at
```

**Índices**:
- `status` - Filtros por estado
- `location` (lat, lng) - Queries geoespaciales
- `created_at DESC` - Ordenamiento por fecha

### Flujo de Autenticación

```
1. Usuario envía POST /auth/login con email + password
2. Backend verifica contra ADMIN_EMAIL y ADMIN_PASSWORD
3. Si es correcto, genera JWT token
4. Cliente almacena token en localStorage
5. Requests protegidos incluyen token en header
6. Middleware verifica y decodifica token
```

## Frontend

### Stack Tecnológico

- **Librería**: React 18.2
- **Build Tool**: Vite 4.3 (reemplazo a Create React App)
- **Routing**: React Router 6.10
- **Mapas**: Leaflet 1.9.4 + React Leaflet 4.2.1
- **Formularios**: React Hook Form 7.43
- **HTTP**: Axios 1.4
- **Estilos**: CSS vanilla (variables CSS)

### Estructura de Componentes

```
App (Router principal)
├── CreateReportPage
│   ├── ReportMap (Leaflet con click)
│   └── ReportForm (Formulario)
└── AdminPage
    ├── AdminMap (Mostrar reportes)
    └── ReportsList (Tabla)
        └── ReportDetail (Modal editar)
```

### Decisiones Clave

#### 1. Vite en lugar de Create React App
- ✅ 10x más rápido
- ✅ Build optimizado
- ✅ HMR instantáneo
- ✅ Mejor DX

#### 2. Leaflet + React Leaflet
- ✅ Mapas sin API key (OpenStreetMap)
- ✅ Librería ligera
- ✅ Full control sobre markers
- ✅ Gratuito para always

#### 3. React Hook Form
- ✅ Validación client-side eficiente
- ✅ Minimal re-renders
- ✅ Integración fácil
- ✅ UX mejorada

#### 4. CSS Vanilla + Variables
- ✅ Sin dependencias extra
- ✅ Tema centralizado
- ✅ Responsive con media queries
- ⚠️ Sin pre-procesador (Sass)
- **Alternativa**: Tailwind CSS si lo prefieres

### Mapas: OpenStreetMap + Leaflet

```javascript
// Tiles gratuitos
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

// Reverse geocoding (obtener dirección desde coords)
https://nominatim.openstreetmap.org/reverse?lat=X&lon=Y

// Rate limit: ~1 req/segundo
// Considerar caché en producción
```

### Autenticación en Cliente

```javascript
// 1. User hace login
const token = response.data.token

// 2. Guardar en localStorage
localStorage.setItem('adminToken', token)

// 3. Recuperar para requests
const token = localStorage.getItem('adminToken')
headers['Authorization'] = `Bearer ${token}`

// 4. Si 401, limpiar y redirigir a login
```

## Flujos Principales

### Crear Reporte

```
1. Usuario abre "/" en navegador
2. Ve mapa de OpenStreetMap con click
3. Hace click → marca ubicación, obtiene coords
4. Completa formulario (tipo, descripción, nombre)
5. Click "Enviar Reporte"
6. Frontend valida con React Hook Form
7. POST /api/reports con datos
8. Backend obtiene dirección con Nominatim
9. Inserta en table `reports` con status="pendiente"
10. Retorna reporte creado con ID
11. Frontend muestra "✓ Reporte enviado"
```

### Admin Actualiza Reporte

```
1. Admin hace login: POST /auth/login
2. Obtiene JWT token, lo guarda en localStorage
3. Navega a "/admin"
4. GET /reports (lista todos con filtros)
5. GET /admin/reports/stats (estadísticas)
6. Mapa muestra todos con colores por status
7. Admin selecciona reporte en tabla
8. Modal abre con detalles
9. Cambia status/prioridad/asignado
10. PATCH /reports/:id con token en header
11. Backend verifica token, actualiza DB
12. Frontend recarga lista
```

## Escalabilidad

### Para crecer de MVP

**Base de Datos**
- Cambiar SQLite → PostgreSQL
- Agregar tabla `users` para múltiples admins
- Agregar tabla `logs` para auditoría

**Backend**
- Caché con Redis (Nominatim, queries frecuentes)
- Rate limiting
- Paginación más eficiente
- WebSockets para actualizaciones en tiempo real

**Frontend**
- Offline-first con service workers
- Carga de fotos
- Mapas con clustering
- PWA (Progressive Web App)

**Infraestructura**
- Docker para containerización
- Kubernetes para orquestación
- CI/CD con GitHub Actions

## Seguridad

### Implementado
- ✅ CORS restringido
- ✅ Helmet.js para headers
- ✅ Prepared statements SQL
- ✅ JWT con expiración
- ✅ bcryptjs para contraseñas
- ✅ Validaciones en ambos lados

### A Considerar
- [ ] Rate limiting
- [ ] HTTPS en producción
- [ ] CSP headers
- [ ] HSTS
- [ ] Logging y monitoreo
- [ ] Penetration testing

## Testing

### Backend (Manual, sin framework)
```bash
# Crear reporte
curl -X POST http://localhost:5000/api/reports ...

# Obtener reportes
curl http://localhost:5000/api/reports

# Login
curl -X POST http://localhost:5000/api/auth/login ...
```

### Frontend (Manual + DevTools)
- F12 → Network: inspeccionar requests
- F12 → Console: verificar errores
- Validar UX en mobile (F12 → Device mode)

### A Agregar
- Jest + Testing Library (React)
- Supertest (API testing)
- E2E con Playwright/Cypress

## Deployment

### Backend

**Heroku / Railway / Render**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=clave-larga-aleatoria
```

**AWS / Azure / GCP**
- Docker image
- Auto-scaling con Kubernetes
- Managed database (RDS, Cloud SQL)

### Frontend

**Vercel / Netlify**
```bash
npm run build
# Desplegar carpeta `dist/`
```

**GitHub Pages**
```bash
npm run build
# Pushear a rama `gh-pages`
```

## Monitoreo

### Métricas Importantes
- Requests por segundo
- Latencia API
- Errores 4xx/5xx
- Reportes pendientes vs resueltos
- Uptime del sistema

### Herramientas
- Sentry (error tracking)
- New Relic / DataDog (APM)
- Google Analytics (frontend)
- Prometheus + Grafana (interno)

---

**Última actualización**: Junio 2026
