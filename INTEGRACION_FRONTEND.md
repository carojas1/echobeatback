# 🔌 Guía de Integración Frontend-Backend EchoBeat

## 📋 Resumen del Backend

El backend de EchoBeat está corriendo en: **http://localhost:3000**
- **API Base URL**: `http://localhost:3000/api/v1`
- **Documentación Swagger**: `http://localhost:3000/api/docs`

---

## 🚀 Iniciar el Backend

```bash
cd "c:\Users\ACER\Downloads\backend echobeat"

# Configurar base de datos (primera vez)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Iniciar servidor
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

---

## 🔐 Autenticación

### 1. Registro de Usuario
```typescript
// POST http://localhost:3000/api/v1/auth/register
const register = async (email: string, password: string, displayName: string) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      displayName
    })
  });
  
  const data = await response.json();
  // data = { user, accessToken, refreshToken }
  
  // Guardar tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  
  return data;
};
```

### 2. Login
```typescript
// POST http://localhost:3000/api/v1/auth/login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Guardar tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  
  return data;
};
```

### 3. Google OAuth
```typescript
// Redirigir al usuario a:
window.location.href = 'http://localhost:3000/api/v1/auth/google';

// Después del callback, recibirás los tokens
```

### 4. Usar Token en Requests
```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
```

---

## 🎵 Endpoints Principales

### **Canciones**

#### Buscar Canciones
```typescript
// GET /api/v1/songs/search?q=query
const searchSongs = async (query: string) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/songs/search?q=${query}`,
    {
      headers: getAuthHeaders()
    }
  );
  return await response.json();
};
```

#### Obtener Canciones Trending
```typescript
// GET /api/v1/songs/trending
const getTrendingSongs = async () => {
  const response = await fetch('http://localhost:3000/api/v1/songs/trending');
  return await response.json();
};
```

#### Subir Canción
```typescript
// POST /api/v1/songs/upload
const uploadSong = async (file: File, metadata: any) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('artist', metadata.artist);
  formData.append('album', metadata.album);
  formData.append('duration', metadata.duration);
  formData.append('genre', metadata.genre);
  
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:3000/api/v1/songs/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

#### Reproducir Canción
```typescript
// GET /api/v1/songs/:id/stream
const playSong = (songId: string) => {
  const audioUrl = `http://localhost:3000/api/v1/songs/${songId}/stream`;
  
  // Usar con HTML5 Audio
  const audio = new Audio(audioUrl);
  audio.play();
  
  return audio;
};

// Incrementar contador de reproducción
const incrementPlayCount = async (songId: string) => {
  await fetch(`http://localhost:3000/api/v1/songs/${songId}/play`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
};
```

---

### **Playlists**

#### Crear Playlist
```typescript
// POST /api/v1/playlists
const createPlaylist = async (name: string, description: string, isPublic: boolean) => {
  const response = await fetch('http://localhost:3000/api/v1/playlists', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description, isPublic })
  });
  return await response.json();
};
```

#### Agregar Canción a Playlist
```typescript
// POST /api/v1/playlists/:id/songs
const addSongToPlaylist = async (playlistId: string, songId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/playlists/${playlistId}/songs`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ songId })
    }
  );
  return await response.json();
};
```

#### Obtener Mis Playlists
```typescript
// GET /api/v1/playlists
const getMyPlaylists = async () => {
  const response = await fetch('http://localhost:3000/api/v1/playlists', {
    headers: getAuthHeaders()
  });
  return await response.json();
};
```

---

### **Favoritos**

```typescript
// Agregar a favoritos
// POST /api/v1/favorites/songs/:id
const addFavorite = async (songId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/favorites/songs/${songId}`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  );
  return await response.json();
};

// Obtener favoritos
// GET /api/v1/favorites/songs
const getFavorites = async () => {
  const response = await fetch('http://localhost:3000/api/v1/favorites/songs', {
    headers: getAuthHeaders()
  });
  return await response.json();
};
```

---

### **Usuarios**

```typescript
// Obtener perfil actual
// GET /api/v1/users/me
const getMyProfile = async () => {
  const response = await fetch('http://localhost:3000/api/v1/users/me', {
    headers: getAuthHeaders()
  });
  return await response.json();
};

// Seguir usuario
// POST /api/v1/users/:id/follow
const followUser = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/users/${userId}/follow`,
    {
      method: 'POST',
      headers: getAuthHeaders()
    }
  );
  return await response.json();
};
```

---

### **Búsqueda Global**

```typescript
// GET /api/v1/search?q=query&type=all
const globalSearch = async (query: string, type = 'all') => {
  const response = await fetch(
    `http://localhost:3000/api/v1/search?q=${query}&type=${type}`
  );
  return await response.json();
};

// Autocomplete
// GET /api/v1/search/autocomplete?q=query
const autocomplete = async (query: string) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/search/autocomplete?q=${query}`
  );
  return await response.json();
};
```

---

### **Recomendaciones**

```typescript
// GET /api/v1/recommendations/songs
const getRecommendedSongs = async () => {
  const response = await fetch('http://localhost:3000/api/v1/recommendations/songs', {
    headers: getAuthHeaders()
  });
  return await response.json();
};

// GET /api/v1/recommendations/playlists
const getPersonalizedPlaylists = async () => {
  const response = await fetch('http://localhost:3000/api/v1/recommendations/playlists', {
    headers: getAuthHeaders()
  });
  return await response.json();
};
```

---

## 🛠️ Servicio API Completo (TypeScript)

```typescript
// services/api.service.ts
const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
  private getHeaders(includeAuth = true) {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(email: string, password: string, displayName: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Songs
  async searchSongs(query: string, page = 1, limit = 20) {
    return this.request(`/songs/search?q=${query}&page=${page}&limit=${limit}`);
  }

  async getTrendingSongs(limit = 20) {
    return this.request(`/songs/trending?limit=${limit}`);
  }

  async getSong(id: string) {
    return this.request(`/songs/${id}`);
  }

  async playSong(songId: string) {
    return this.request(`/songs/${songId}/play`, { method: 'POST' });
  }

  // Playlists
  async getMyPlaylists() {
    return this.request('/playlists');
  }

  async createPlaylist(data: any) {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addSongToPlaylist(playlistId: string, songId: string) {
    return this.request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId }),
    });
  }

  // Favorites
  async getFavorites() {
    return this.request('/favorites/songs');
  }

  async addFavorite(songId: string) {
    return this.request(`/favorites/songs/${songId}`, { method: 'POST' });
  }

  async removeFavorite(songId: string) {
    return this.request(`/favorites/songs/${songId}`, { method: 'DELETE' });
  }

  // Users
  async getMyProfile() {
    return this.request('/users/me');
  }

  async updateProfile(data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(userId: string) {
    return this.request(`/users/${userId}/follow`, { method: 'POST' });
  }

  // Search
  async globalSearch(query: string, type = 'all') {
    return this.request(`/search?q=${query}&type=${type}`);
  }

  // Recommendations
  async getRecommendations() {
    return this.request('/recommendations/songs');
  }
}

export const api = new ApiService();
```

---

## ⚙️ Configuración de CORS

El backend ya está configurado para aceptar requests desde `http://localhost:8100`. Si tu frontend corre en otro puerto, edita:

```typescript
// backend echobeat/src/main.ts
app.enableCors({
  origin: 'http://localhost:TU_PUERTO',  // Cambia esto
  credentials: true,
});
```

---

## 🔄 Ejemplo de Flujo Completo

```typescript
// 1. Login
const loginUser = async () => {
  const result = await api.login('user@example.com', 'password123');
  localStorage.setItem('accessToken', result.data.accessToken);
  localStorage.setItem('refreshToken', result.data.refreshToken);
};

// 2. Buscar canciones
const songs = await api.searchSongs('bohemian rhapsody');

// 3. Reproducir canción
const audio = new Audio(`http://localhost:3000/api/v1/songs/${songs.data.songs[0].id}/stream`);
audio.play();

// 4. Agregar a favoritos
await api.addFavorite(songs.data.songs[0].id);

// 5. Crear playlist
const playlist = await api.createPlaylist({
  name: 'My Playlist',
  description: 'Cool songs',
  isPublic: true
});

// 6. Agregar canción a playlist
await api.addSongToPlaylist(playlist.data.id, songs.data.songs[0].id);
```

---

## 📚 Recursos

- **Swagger Docs**: http://localhost:3000/api/docs
- **Backend README**: `backend echobeat/README.md`
- **Database Schema**: `backend echobeat/prisma/schema.prisma`

---

## 🐛 Troubleshooting

### Error CORS
Si ves errores de CORS, asegúrate de que el backend esté corriendo y que el `origin` en `main.ts` coincida con la URL de tu frontend.

### Error 401 Unauthorized
Verifica que el token JWT esté guardado correctamente y se envíe en el header `Authorization: Bearer <token>`.

### Error de Conexión
Asegúrate de que el backend esté corriendo en `http://localhost:3000`:
```bash
npm run start:dev
```
