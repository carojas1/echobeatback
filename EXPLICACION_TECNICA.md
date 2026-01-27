# 📘 Explicación Técnica del Backend EchoBeat

Este documento resume cómo funciona tu backend para que puedas responder preguntas técnicas con confianza.

## 1. Stack Tecnológico (¿Qué usaste?)

- **Framework:** **NestJS** (Node.js). Es un framework progresivo y modular.
- **Lenguaje:** **TypeScript** (JavaScript con tipos estáticos).
- **Base de Datos:** **PostgreSQL** (alojada en Neon Tech).
- **ORM:** **Prisma** (para interactuar con la base de datos de forma fácil).
- **Autenticación:** **Firebase Auth** (Manejo de identidad) + Guardias de NestJS.
- **Archivos:** Almacenamiento local en disco (`/uploads`), servido estáticamente.

---

## 2. Arquitectura (¿Cómo está organizado?)

El proyecto sigue una arquitectura **Modular**. Cada "feature" tiene su propia carpeta (Auth, Songs, Users).

El patrón de diseño principal es **Controlador - Servicio - Repositorio**:

1.  **Controller (`.controller.ts`):** Recibe la petición HTTP (GET, POST), valida datos básicos y llama al servicio.
2.  **Service (`.service.ts`):** Contiene la lógica de negocio (validaciones complejas, cálculos, llamadas a BD).
3.  **Prisma (ORM):** Es la capa de datos que ejecuta las queries SQL reales.

### Módulos Principales:

- `AppModule`: El módulo raíz que une todo. Configura la base de datos y sirve los archivos estáticos.
- `SongsModule`: Maneja la subida, búsqueda y reproducción de canciones.
- `AuthModule`: Maneja la verificación de tokens de Firebase.

---

## 3. Flujos Clave (¿Cómo funciona "X" cosa?)

### A. Autenticación (Login)

1.  **Frontend:** El usuario se loguea con Google/Email en React. Firebase devuelve un **Token (JWT)**.
2.  **Petición:** El frontend envía este token en el Header: `Authorization: Bearer <TOKEN>`.
3.  **Backend (`FirebaseAuthGuard`):**
    - Intercepta la petición.
    - Decodifica el token usando `firebase-admin`.
    - Si es válido, inyecta el usuario (`req.user`) y permite el paso.
    - Si no, devuelve error `401 Unauthorized`.

### B. Subida de Canciones (Upload)

1.  **Frontend:** Envía un `FormData` con el archivo de audio (`file`) y los datos (`title`, `artist`).
2.  **Controller (`SongsController`):** Usa `FileInterceptor` para recibir el binario.
3.  **Service (`SongsService`):**
    - Genera un nombre único (UUID).
    - Guarda el archivo físicamente en la carpeta `backend/uploads/songs`.
    - Construye una URL pública: `http://localhost:1753/uploads/songs/nombre-archivo.mp3`.
    - Guarda esa URL y los metadatos en PostgreSQL mediante Prisma.

---

## 4. Base de Datos (Prisma Schema)

Tienes 3 modelos principales en `schema.prisma`:

- **User:** Usuarios guardados localmente (email, rol, etc.) sincronizados con Firebase.
- **Song:** Canciones con título, artista, duración y **fileUrl** (la ruta al archivo).
- **Playlist:** Listas creadas por usuarios que relacionan múltiples canciones.

---

## 5. Preguntas Trampa (¡Prepárate!)

**P: ¿Por qué usaste NestJS y no Express puro?**
R: Porque NestJS me da una estructura sólida (Arquitectura Modular), inyección de dependencias y soporte nativo de TypeScript, lo que hace el código más mantenible y escalable que Express "crudo".

**P: ¿Dónde se guardan las canciones?**
R: Actualmente se guardan en el sistema de archivos local del servidor (carpeta `/uploads`), y el backend sirve esa carpeta como estática. La base de datos solo guarda la **URL** (referencia).

**P: ¿Cómo aseguras que solo usuarios logueados suban música?**
R: Uso un **Guard** personalizado (`FirebaseAuthGuard`) que verifica el token de Firebase en cada petición protegida antes de que llegue al controlador.

**P: ¿Qué hace Prisma?**
R: Es mi ORM. Traduce mi código TypeScript a consultas SQL seguras para PostgreSQL, y me da autocompletado de los tipos de datos de mi base de datos.
