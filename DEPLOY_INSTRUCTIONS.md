# Instrucciones de Deploy - Sistema de Reportes de Alumbrado Público

## ✅ Frontend - Vercel

### Cambios Recientes:
1. ✅ Componente BottomSheet implementado para móvil
2. ✅ Mapa optimizado para pantallas pequeñas
3. ✅ Panel deslizable con información del problema
4. ✅ Responsive design mejorado

### Para hacer Deploy:

1. **Asegúrate que los cambios están commiteados:**
```bash
cd frontend
git add .
git commit -m "Implementar BottomSheet y optimizar UI móvil"
```

2. **Configura Vercel para usar dist-build (temporal):**
   - En Vercel, ve a Project Settings > Build & Development Settings
   - Output Directory: `dist-build` (hasta que se arregle el problema de permisos)
   - O espera a que npm run build genere `dist` normalmente

3. **Deploy automático:**
   - Solo haz push a la rama principal
   - Vercel detectará cambios y hará build automáticamente

### Configuración de Variables de Entorno en Vercel:
```
VITE_API_URL=https://tu-backend-en-render.onrender.com
```

## ✅ Backend - Render

Sin cambios en esta sesión. El backend sigue en Render.

## 📝 Cambios Implementados:

### Mobile UI (Nuevo):
- **BottomSheet Component**: Panel que se desliza desde abajo
- **Drag Support**: Arrastra hacia arriba para ver más
- **Responsive Maps**: Dejan espacio para el panel
- **Z-index optimizado**: El panel siempre está visible encima del mapa

### Archivos Modificados:
- `/frontend/src/components/BottomSheet.jsx` (NUEVO)
- `/frontend/src/styles/bottomsheet.css` (NUEVO)
- `/frontend/src/pages/CreateReportPage.jsx` (ACTUALIZADO)
- `/frontend/src/pages/AdminPage.jsx` (ACTUALIZADO)
- `/frontend/src/styles/pages.css` (ACTUALIZADO)
- `/frontend/vite.config.js` (ACTUALIZADO)

## 🚀 Próximos Pasos:

1. Verifica que todo funciona en tu máquina local:
   ```bash
   npm run dev
   ```

2. Haz push a GitHub:
   ```bash
   git push origin main
   ```

3. Vercel hará build y deploy automáticamente

4. Prueba en: https://tu-dominio-vercel.vercel.app

¡Listo para usar en producción! 🎉
