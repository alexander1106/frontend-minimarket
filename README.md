# Minimarket · Frontend

Aplicación web para administrar **minimarkets y bodegas** en Perú: punto de venta, inventario, compras, caja, reportes y seguridad por roles. Es un sistema **multiempresa y multisucursal** (SaaS): un superadmin administra la plataforma y cada empresa gestiona su propio negocio.

Hecho con **Angular 19** (componentes standalone) y consume una API REST en Spring Boot.

## Funcionalidades

**Punto de venta**
- Cobro rápido con ticket, boleta simple o con cliente, y factura.
- Consulta de DNI/RUC (apisperu) para registrar clientes al vuelo.
- Lector de códigos de barras: escanea o escribe el código y presiona Enter.
- Presentaciones de producto (caja, saco, etc.) con conversión a unidad base.
- Delivery con autocompletado de direcciones (OpenStreetMap).
- Cada cobro va al turno de caja correspondiente: el cajero usa el suyo; admin, empresa y supervisor eligen en cuál cobrar.

**Comprobantes**
- Boleta en formato ticket de 80 mm.
- Factura en A4 con el formato de SUNAT, con monto en letras e IGV.

**Inventario y compras**
- Almacenes, inventario por producto, ajustes y traslados.
- Compras con proveedores, lotes y vencimientos, y kardex.
- Productos, categorías, tipos de producto y unidades de medida.

**Caja**
- Cajas por sucursal, apertura de turnos, transacciones y transferencias entre cajas.
- Arqueo y cierre, con el detalle de ventas por vendedor.

**Reportes y administración**
- Reportes de ventas y almacenes.
- Notificaciones (stock bajo, por vencer, suscripciones) con campana en el encabezado.
- Perfil de usuario y menú de sesión.

**Consola del superadmin**
- Empresas, sucursales, planes, catálogos globales, usuarios y roles.
- Auditoría: quién hizo qué, con filtros, detalle y exportación a CSV.

## Roles

| Rol | Acceso |
|---|---|
| SUPERADMIN | Consola de la plataforma: empresas, planes, catálogos, roles y auditoría |
| EMPRESA / ADMIN | Todo el negocio de su empresa o sucursal |
| CAJERO | Ventas, cobros y su turno de caja |
| ALMACENERO | Productos, inventario, almacenes y compras |
| SUPERVISOR | Delivery y dashboard |

Los módulos visibles dependen de los permisos que devuelve el backend (`/mis-modulos`).

## Requisitos

- Node.js 18 o superior
- Angular CLI (`npm i -g @angular/cli`)
- La API del minimarket en ejecución (por defecto `http://localhost:8080/api/minimarket`)

## Puesta en marcha

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. La primera vez se crea `src/app/components/api-keys.ts` a partir del ejemplo.

### Configuración

- **URL de la API:** se define en `src/app/components/link.ts`. En `localhost` usa `http://localhost:8080/api/minimarket`; en cualquier otro dominio usa `URL_PRODUCCION`, que debes cambiar por la URL de tu API desplegada.
- **Token de DNI/RUC:** crea una cuenta gratuita en [apisperu.com](https://apisperu.com) y pega tu token en `src/app/components/api-keys.ts`. Ese archivo no se sube a Git. Sin token, la consulta de documentos queda desactivada y se pueden escribir los datos a mano.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Compilación de producción en `dist/sistema-clinico-reservas/browser` |
| `npm run watch` | Compilación en modo desarrollo con recarga |
| `npm test` | Pruebas unitarias |

## Despliegue

Incluye `netlify.toml` y `public/_redirects` para Netlify (compila con `npm run build` y redirige todas las rutas a `index.html`). Antes de publicar, cambia `URL_PRODUCCION` en `link.ts`. La API debe permitir CORS desde el dominio del frontend.

## Estructura

```
src/app/
├── components/   Barra lateral, encabezado, campana, menú de usuario, paginación
├── guards/       AccessGuard (sesión) y SuperadminGuard
├── pages/
│   ├── login/    Inicio de sesión y recuperación de clave
│   └── admin/    Pantallas por módulo (ventas, inventario, caja, compras, auditoría…)
└── service/      Servicios HTTP e interceptor de autenticación
```

## Notas

- La sesión usa un token JWT que el interceptor agrega solo a las peticiones a la API. Si el token vence, se cierra la sesión.
- "Recordarme" mantiene la sesión al cerrar el navegador; sin marcarla, se cierra al salir.
- Los comprobantes que genera el frontend son representaciones impresas: no incluyen el código QR ni el hash de SUNAT, que requieren emisión electrónica con un proveedor autorizado.
