# Sistema de Reportes de Alumbrado Público

Plataforma web completa para reportar y gestionar problemas de alumbrado público en tu zona.

**Características:**
- 📍 Mapa interactivo para seleccionar ubicación del problema
- 📝 Formulario para reportar problemas
- 🗺️ Panel admin con vista de todos los reportes
- 🎯 Actualización de estado, prioridad y asignación
- 📊 Filtros y búsqueda
- 🔐 Autenticación admin con JWT

## Estructura del Proyecto

```
proyecto-alumbrado-publico/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── index.js           # Servidor principal
│   │   ├── config/            # Configuración
│   │   ├── models/            # Modelos de datos
│   │   ├── controllers/       # Controladores
│   │   ├── routes/            # Rutas API
│   │   └── middleware/        # Middleware
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/                   # App React + Vite
│   ├── src/
│   │   ├── pages/            # Páginas principales
│   │   ├── components/       # Componentes React
│   │   ├── styles/           # CSS
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── .gitignore
└── README.md (este archivo)
```

## Requisitos Previos

- **Node.js** v18+ [Descargar](https://nodejs.org/)
- **npm** v9+ (viene con Node.js)
- Terminal/CMD

## Setup Inicial (5 minutos)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

El servidor estará en `http://localhost:5000`

Prueba que funcione:
```bash
curl http://localhost:5000/health
```

### 2. Frontend (en otra terminal)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La app estará en `http://localhost:5173`

### 3. Credenciales Admin

Por defecto:
- Email: `admin@example.com`
- Contraseña: `admin123`

Cambialos en `backend/.env` para producción.

## Primeros Pasos

1. **Abre** `http://localhost:5173` en el navegador
2. **Haz click en el mapa** para seleccionar una ubicación
3. **Completa el formulario** y envía el reporte
4. **Ve al panel admin** (botón "Admin Login")
5. **Inicia sesión** y verás los reportes

## API Endpoints

### Crear Reporte (Público)
```bash
POST /api/reports
Content-Type: application/json

{
  "latitude": -34.5901,
  "longitude": -58.3891,
  "problem_type": "apagado|parpadea|danado|otro",
  "description": "Descripción del problema",
  "reporter_name": "Tu nombre"
}
```

### Obtener Reportes (Público)
```bash
GET /api/reports?status=pendiente&limit=50
```

### Login Admin
```bash
POST /api/auth/login

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Actualizar Reporte (Protegido)
```bash
PATCH /api/reports/1
Authorization: Bearer <token>

{
  "status": "resuelto",
  "priority": "alta",
  "admin_notes": "Se reparó",
  "assigned_to": "Cuadrilla A"
}
```

Ver más detalles en:
- `backend/README.md` - Documentación completa API
- `frontend/README.md` - Documentación Frontend

## Desarrollo

### Estructura de carpetas

**Backend:**
- `src/config/` - Configuración de BD, variables
- `src/models/` - Clases de modelos (Report, etc)
- `src/controllers/` - Lógica de negocio
- `src/routes/` - Definición de endpoints
- `src/middleware/` - Auth, error handling

**Frontend:**
- `src/pages/` - Páginas principales
- `src/components/` - Componentes reutilizables
- `src/styles/` - Estilos CSS
- `src/services/` - Clientes HTTP

### Tecnologías

**Backend:**
- Node.js v18+
- Express.js 4.x
- SQLite 3 (desarrollo)
- JWT para autenticación
- Helmet para seguridad

**Frontend:**
- React 18.2
- Vite 4.3
- React Router 6
- Leaflet + React Leaflet
- React Hook Form

## Deployment

### Backend (Producción)

```bash
cd backend
npm install
npm run start
```

Configurar variables en `.env`:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=una-clave-segura-muy-larga
DATABASE_URL=postgresql://user:pass@host/db
```

### Frontend (Producción)

```bash
cd frontend
npm run build
```

Desplegar carpeta `dist/` en:
- Vercel
- Netlify
- GitHub Pages
- Servidor propio

## Testing Manual

### Crear reporte con curl
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -34.5901,
    "longitude": -58.3891,
    "problem_type": "apagado",
    "description": "Sin luz en la esquina",
    "reporter_name": "Juan"
  }'
```

### Obtener reportes
```bash
curl http://localhost:5000/api/reports
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Base de Datos

SQLite con tabla `reports`:
- Ubicación (lat, lng, address)
- Problema (tipo, descripción)
- Reportero (nombre, email, teléfono)
- Gestión (estado, prioridad, asignado)
- Timestamps (creado, actualizado, resuelto)

Índices en:
- `status`
- `location` (lat, lng)
- `created_at`

## Próximas Mejoras

- [ ] Carga de fotos
- [ ] Notificaciones por email
- [ ] Base de datos de usuarios
- [ ] Rutas con indicaciones
- [ ] Estadísticas y gráficos
- [ ] App móvil (React Native)
- [ ] PostgreSQL para escala
- [ ] Docker para deployment

## Solucionar Problemas

### Frontend no se conecta al backend
- Verifica que backend esté en `http://localhost:5000`
- Revisa `frontend/.env` y VITE_API_URL
- Abre DevTools (F12) → Network para ver requests

### Port 5000 ya está en uso
```bash
# Cambiar en backend/.env
PORT=5001
```

### Port 5173 ya está en uso
```bash
# Vite usará automáticamente otro puerto (5174, 5175...)
```

### Error "CORS"
- Backend no está corriendo
- Frontend URL no está permitida en CORS
- Revisa `backend/src/index.js` línea de CORS

## Licencia

MIT

## Contacto

cristian.rauz@technovahosting.com

---

**¿Necesitas ayuda?** Revisa los README en:
- `backend/README.md` - Detalles de API
- `frontend/README.md` - Detalles de interfaz
