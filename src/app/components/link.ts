// URL de la API desplegada (Railway/Render), sin barra final. Reemplázala por la tuya al publicar el frontend.
const URL_PRODUCCION = 'https://TU-API.up.railway.app/api/minimarket';
const enLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
let baseUrl = enLocal ? 'http://localhost:8080/api/minimarket' : URL_PRODUCCION;
export default baseUrl;

// Token de https://apisperu.com (consulta de DNI/RUC). Vive en api-keys.ts, que no se sube al repositorio.
export { apisPeruToken } from './api-keys';
