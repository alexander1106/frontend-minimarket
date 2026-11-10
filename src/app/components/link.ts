// URL de la API desplegada en Render, sin barra final. En localhost se usa automáticamente el backend local.
const URL_PRODUCCION = 'https://minimarket-api-v0sr.onrender.com/api/minimarket';
const enLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
let baseUrl = enLocal ? 'http://localhost:8080/api/minimarket' : URL_PRODUCCION;
export default baseUrl;

// Token de https://apisperu.com (consulta de DNI/RUC). Se genera en api-keys.ts desde la variable de entorno APISPERU_TOKEN (o a mano en local); ese archivo no se sube al repositorio.
export { apisPeruToken } from './api-keys';
