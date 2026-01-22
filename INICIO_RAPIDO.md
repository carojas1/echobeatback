# 🚀 Guía Rápida de Integración

## 📝 Resumen

He creado el backend completo de EchoBeat y los archivos necesarios para conectarlo con tu frontend Ionic/Vue.

## ✅ Archivos Creados

### Backend
- ✅ 70+ archivos del servidor NestJS
- ✅ Base de datos con Prisma
- ✅ 10 módulos completos de funcionalidades
- ✅ Documentación Swagger

### Frontend (Archivos nuevos para tu proyecto)
1. **`src/services/api.service.ts`** - Servicio completo de API con Axios
2. **`src/composables/useAuth.ts`** - Composable de autenticación
3. **`src/composables/useSongs.ts`** - Composable de canciones
4. **`src/views/Login.vue`** - Página de login completa
5. **`src/views/Songs.vue`** - Página de búsqueda de canciones

## 🔧 Pasos para Conectar

### 1. Instalar Axios (si no lo tienes)
```bash
cd "c:\Users\ACER\Downloads\echo beat"
npm install axios
```

### 2. Iniciar el Backend
```bash
# En una terminal
cd "c:\Users\ACER\Downloads\backend echobeat"

# Primera vez - configurar base de datos
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Iniciar servidor
npm run start:dev
```

El backend estará en: **http://localhost:3000**

### 3. Iniciar el Frontend
```bash
# En otra terminal
cd "c:\Users\ACER\Downloads\echo beat"
npm run dev
```

Tu frontend estará en: **http://localhost:8100**

## 🎯 Endpoints Principales del Backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Registrar usuario |
| `/api/v1/auth/login` | POST | Iniciar sesión |
| `/api/v1/auth/google` | GET | Login con Google |
| `/api/v1/songs/search?q=query` | GET | Buscar canciones |
| `/api/v1/songs/trending` | GET | Canciones populares |
| `/api/v1/songs/:id/stream` | GET | Reproducir canción |
| `/api/v1/playlists` | GET/POST | Gestionar playlists |
| `/api/v1/favorites/songs/:id` | POST/DELETE | Favoritos |

## 📖 Documentación Completa

- **Guía de integración**: `backend echobeat/INTEGRACION_FRONTEND.md`
- **Swagger API Docs**: http://localhost:3000/api/docs
- **Walkthrough**: Ver artifact `walkthrough.md`

## 🔐 Autenticación

```typescript
// Ejemplo de uso en tu frontend
import { useAuth } from '@/composables/useAuth';

const { login, user, isAuthenticated } = useAuth();

// Login
await login('user@example.com', 'password123');

// Verificar si está autenticado
if (isAuthenticated.value) {
  console.log('Usuario:', user.value);
}
```

## 🎵 Reproducir Canciones

```typescript
// Ejemplo de uso
import { useSongs } from '@/composables/useSongs';

const { searchSongs, playSong, songs } = useSongs();

// Buscar
await searchSongs('bohemian rhapsody');

// Reproducir
await playSong(songs.value[0].id);
```

## ⚡ Próximos Pasos

1. ✅ Backend funcionando en `localhost:3000`
2. ✅ Frontend funcionando en `localhost:8100`
3. 📝 Usa los archivos creados (`Login.vue`, `Songs.vue`)
4. 🔧 Personaliza según tus necesidades
5. 📚 Consulta Swagger docs para más endpoints

## 🆘 Si Hay Errores

### Error de CORS
El backend ya está configurado para `http://localhost:8100`. Si tu frontend usa otro puerto, edita:
```typescript
// backend echobeat/src/main.ts línea 14
app.enableCors({
  origin: 'http://localhost:TU_PUERTO',
  credentials: true,
});
```

### Error 401 (No autorizado)
Verifica que el token JWT se esté guardando y enviando correctamente.

### Base de datos no conecta
Asegúrate de tener PostgreSQL instalado y ejecutando. Edita `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/echobeat"
```

## 📞 ¿Necesitas Ayuda?

Revisa:
1. `INTEGRACION_FRONTEND.md` - Guía completa de integración
2. http://localhost:3000/api/docs - Documentación Swagger
3. Console del navegador - Para ver errores
