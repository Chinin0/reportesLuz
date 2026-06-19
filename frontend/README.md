# Frontend - Sistema de Reportes de Alumbrado Público

Interfaz React + Leaflet para reportar y gestionar problemas de alumbrado público.

## Setup Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_MAP_CENTER_LAT=-34.6037
VITE_MAP_CENTER_LNG=-58.3816
```

### 3. Iniciar servidor
```bash
npm run dev
```

App corriendo en `http://localhost:5173`

## Características

**Página Pública** (`/`)
- Mapa interactivo con click para marcar ubicación
- Formulario para reportar problema
- Validaciones en cliente
- Geolocalización automática (Nominatim/OpenStreetMap)

**Panel Admin** (`/admin`)
- Tabla con todos los reportes
- Mapa mostrando ubicación de reportes
- Filtros por estado y prioridad
- Actualizar estado, prioridad, notas y asignación
- Colores visuales según estado

## Componentes Principales

```
src/
├── pages/
│   ├── CreateReportPage.jsx     # Página para reportar
│   └── AdminPage.jsx            # Panel admin
├── components/
│   ├── Map/
│   │   ├── ReportMap.jsx        # Mapa con click
│   │   └── AdminMap.jsx         # Mapa con reportes
│   ├── Forms/
│   │   └── ReportForm.jsx       # Formulario de envío
│   ├── Admin/
│   │   └── ReportsList.jsx      # Tabla de reportes
│   └── Common/
├── services/
│   └── api.js                   # Cliente HTTP
├── hooks/
│   └── ...
└── styles/
    ├── index.css                # Estilos globales
    ├── app.css                  # Estilos app
    ├── pages.css                # Estilos páginas
    ├── forms.css                # Estilos formularios
    └── admin.css                # Estilos admin
```

## Stack

- **React** 18.2 - Interfaz
- **Vite** 4.3 - Build tool
- **React Router** 6.10 - Routing
- **Leaflet** 1.9.4 - Mapas
- **React Leaflet** 4.2.1 - Integración React + Leaflet
- **React Hook Form** 7.43 - Gestión de formularios
- **Axios** 1.4 - Cliente HTTP

## Mapa

OpenStreetMap con Leaflet:
- Sin API key requerida
- Tiles gratuitos
- Soporte para markers personalizados
- Popup interactivos

## Autenticación

- Login con email/contraseña
- Token JWT guardado en localStorage
- Rutas protegidas para admin
- Auto-logout si token expira

## Estilos

- Diseño responsive (mobile-first)
- Variables CSS para tema
- Animaciones suaves
- Accesibilidad básica

## Build para producción
```bash
npm run build
```

Genera carpeta `dist/` lista para deployar.

## Notas

- Frontend consume API en `VITE_API_URL`
- CORS debe estar habilitado en backend
- LocalStorage se usa para guardar token admin
- Responsive en mobile/tablet/desktop
