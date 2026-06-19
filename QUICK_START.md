# Quick Start - Sistema de Reportes de Alumbrado Público

Dale solo **5 minutos** para tener la app corriendo.

## 1️⃣ Descargar Node.js

[nodejs.org](https://nodejs.org) → Descargar LTS (recomendado)

Verifica que se instaló:
```bash
node --version
npm --version
```

## 2️⃣ Abrir dos terminales

### Terminal 1: Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Espera a ver: `✓ Server running on http://localhost:5000`

### Terminal 2: Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Espera a ver: `Local: http://localhost:5173`

## 3️⃣ Abre el navegador

Ve a **http://localhost:5173**

## 4️⃣ Prueba la app

✅ Click en el mapa para marcar ubicación
✅ Completa el formulario y envía reporte
✅ Haz click en "Admin Login"
✅ Email: `admin@example.com` Contraseña: `admin123`
✅ ¡Ves tu reporte en el panel!

## 🔧 Solucionar Problemas

**Backend no inicia**
```bash
npm install -g nodemon
npm run dev
```

**Puerto 5000 ocupado**
```bash
# Cambiar en backend/.env
PORT=5001
```

**Frontend no ve backend**
- Verifica que backend esté corriendo
- Abre DevTools (F12) → Network
- Busca si hay errores CORS

## 📚 Documentación Completa

- `README.md` - Guía general
- `backend/README.md` - API endpoints
- `frontend/README.md` - Componentes

## 🚀 Próximos Pasos

1. Cambiar credenciales admin en `backend/.env`
2. Personalizar colores/textos en `frontend/src/styles/`
3. Agregar tu zona al mapa (VITE_MAP_CENTER en `frontend/.env`)
4. Desplegar a producción

---

¿Atascado? Revisa logs en las terminales.
