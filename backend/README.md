# API - Sistema de Reportes de Alumbrado Público

Backend Node.js + Express para gestionar reportes de problemas de alumbrado público.

## Setup Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```
PORT=5000
NODE_ENV=development
DATABASE_URL=sqlite:./reports.db
JWT_SECRET=tu-clave-segura-aqui
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Inicializar base de datos
```bash
npm run migrate
```

### 4. Iniciar servidor
```bash
npm run dev
```

Servidor corriendo en `http://localhost:5000`

## Endpoints

### Crear reporte (público)
```
POST /api/reports
Content-Type: application/json

{
  "latitude": -34.5901,
  "longitude": -58.3891,
  "problem_type": "apagado|parpadea|danado|otro",
  "description": "Descripción del problema",
  "reporter_name": "Tu nombre",
  "reporter_email": "tu@email.com",
  "reporter_phone": "+54911234567"
}
```

### Obtener reportes (público)
```
GET /api/reports?status=pendiente&limit=50&offset=0
```

### Obtener reporte específico (público)
```
GET /api/reports/:id
```

### Login admin
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "expires_in": 86400
}
```

### Actualizar reporte (protegido)
```
PATCH /api/reports/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "pendiente|asignado|en_progreso|resuelto|rechazado",
  "priority": "baja|media|alta",
  "admin_notes": "Notas del admin",
  "assigned_to": "Nombre de la cuadrilla"
}
```

### Eliminar reporte (protegido)
```
DELETE /api/reports/:id
Authorization: Bearer <token>
```

### Estadísticas (protegido)
```
GET /api/stats
Authorization: Bearer <token>
```

## Testing con curl

### Crear reporte
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -34.5901,
    "longitude": -58.3891,
    "problem_type": "apagado",
    "description": "Semáforo apagado en la esquina",
    "reporter_name": "Juan Pérez"
  }'
```

### Obtener todos los reportes
```bash
curl http://localhost:5000/api/reports
```

### Login admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Actualizar reporte (requiere token)
```bash
TOKEN="tu-token-aqui"
curl -X PATCH http://localhost:5000/api/reports/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resuelto"}'
```

## Estructura de carpetas

```
backend/
├── src/
│   ├── index.js                # Punto de entrada
│   ├── config/
│   │   └── database.js         # Conexión SQLite
│   ├── models/
│   │   └── Report.js           # Modelo de datos
│   ├── controllers/
│   │   └── reportController.js # Lógica de negocio
│   ├── routes/
│   │   └── reportRoutes.js     # Definición de rutas
│   └── middleware/
│       ├── auth.js             # Autenticación JWT
│       └── errorHandler.js     # Manejo de errores
├── .env.example                # Variables de entorno
├── package.json
└── README.md
```

## Base de datos

SQLite con tabla `reports`:
- id (PK)
- latitude, longitude
- address (obtenida automáticamente)
- problem_type (apagado, parpadea, danado, otro)
- description
- reporter_name, reporter_email, reporter_phone
- status (pendiente, asignado, en_progreso, resuelto, rechazado)
- priority (baja, media, alta)
- admin_notes
- created_at, updated_at, resolved_at

## Autenticación

- Login con credenciales del admin (email/password)
- Genera JWT token válido por 24h
- Token se envía en header: `Authorization: Bearer <token>`

## Notas

- Las coordenadas de latitud/longitud se obtienen del cliente
- La dirección se obtiene automáticamente usando Nominatim (OpenStreetMap)
- El rate limit de Nominatim es ~1 request/segundo, considerar caché en producción
