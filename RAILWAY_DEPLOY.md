# Guía de Despliegue en Railway - EchoBeat Backend

## 🚀 Pasos para Desplegar

### 1. Subir a GitHub (si no lo has hecho)

```bash
git add .
git commit -m "feat: railway deployment configuration"
git push origin main
```

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio `backend echobeat`

### 3. Configurar Variables de Entorno

En Railway Dashboard → tu proyecto → **Variables**, agrega:

```env
# Base de Datos (tu Neon actual)
DATABASE_URL=postgresql://USER:PASSWORD@host/database?sslmode=require

# Firebase Admin (⚠️ CONFIGURA DIRECTAMENTE EN RAILWAY - NO AQUÍ)
FIREBASE_CREDENTIALS_JSON=<configura-en-railway-dashboard>

# JWT (cambia estos en producción!)
JWT_SECRET=<tu-secreto-seguro>
JWT_REFRESH_SECRET=<tu-secreto-refresh-seguro>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<tu-cloud-name>
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>

# Admin
ADMIN_EMAIL=<tu-email-admin>

# Producción
NODE_ENV=production

# FRONTEND_URL - pon la URL de tu app aquí después
FRONTEND_URL=http://localhost:5173
```

### 4. Railway Hará el Deploy Automáticamente

Railway detectará tu `railway.json` y ejecutará:

1. `npm install` → ejecuta `postinstall` → `prisma generate`
2. `npm run build` → compila TypeScript
3. `npm run start:prod` → inicia el servidor

### 5. Verificar que Funciona

Una vez desplegado, visita:

```
https://[tu-app].railway.app/api/docs
```

Deberías ver la documentación Swagger de tu API.

---

## 🔗 Conectar tu APK al Backend

En tu frontend/APK, actualiza la URL de la API:

```typescript
// En tu archivo de configuración de API
const API_BASE_URL = 'https://[tu-app].railway.app/api/v1';
```

El endpoint de login/sync es:

```
POST https://[tu-app].railway.app/api/v1/auth/sync
```

---

## ⚠️ Después del Despliegue

1. **Rotar la clave de Firebase** - Ve a Firebase Console → Settings → Service Accounts → Generate New Private Key
2. Actualiza `FIREBASE_CREDENTIALS_JSON` en Railway con la nueva clave
3. Borra este archivo de la guía después de copiar las variables
