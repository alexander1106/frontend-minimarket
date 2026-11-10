# Brief de diseño UI/UX – Sistema de Minimarket (GASBACORB)

> Pega este documento completo en Google AI Studio. Pídele: "Diseña la interfaz completa de este sistema (design system + pantallas clave) siguiendo este brief. Entrégame HTML/CSS (o componentes) moderno, limpio, responsive y accesible."

## 1. Qué es el producto
Sistema web **multiempresa y multisucursal** para administrar **minimarkets y bodegas** en Perú (moneda: soles **S/**, comprobantes **Boleta/Factura**, pagos con **Efectivo, Yape, Plin y tarjetas**).
Cubre: punto de venta (caja rápida), inventario, compras, clientes, cotizaciones, delivery, control de caja (apertura, arqueo y cierre), reportes y seguridad por roles.

**Usuarios y su contexto**
| Rol | Qué hace | Contexto de uso |
|---|---|---|
| CAJERO | Vende, cobra, abre/cierra caja, cotiza, delivery | Pantalla de escritorio/tablet en mostrador, uso intensivo y rápido, a veces con lector de código de barras |
| ALMACENERO | Productos, inventario, almacenes, compras | Escritorio, tareas de carga y revisión de tablas |
| ADMIN | Todo lo de la sucursal + usuarios | Escritorio, revisa reportes y configura |
| SUPERVISOR | Delivery y dashboard | Escritorio / móvil |
| EMPRESA | Ventas y clientes | Escritorio |
| SUPERADMIN | Empresas, sucursales, roles, módulos (plataforma completa) | Escritorio |

**Principios de diseño buscados**: rápido de leer, pocos clics para cobrar, jerarquía clara, contraste AA, botones táctiles (≥40 px), estados vacíos/carga/error cuidados, feedback inmediato, consistente en todas las pantallas. Tono: profesional, moderno, confiable, amigable (no corporativo gris).

## 2. Identidad visual actual (a mejorar, no obligatoria)
- Color de marca: **esmeralda** (`#10b981`, `#059669`, `#047857`), fondo de página gris muy claro (`#f3f5f8`), texto `#111827`, bordes `#e5e7eb`.
- Peligro `#dc2626`, aviso `#d97706`, info `#2563eb`.
- Tipografía: Inter / Segoe UI. Radios 8/12/16 px. Sombras suaves.
- Iconos: Font Awesome 6. Logo: tile esmeralda con icono de tienda.
- **Login (referencia de estilo aprobada)**: pantalla partida 70/30. Izquierda: foto de supermercado a pantalla completa con degradado oscuro, insignia ("PUNTO DE VENTA RÁPIDO"), título grande, subtítulo verde, descripción, slider de 4 slides (botones 1-4 + flechas). Derecha (blanca): logo, "Bienvenido", botones Google/Facebook, divisor "o ingresa con tu cuenta", campos USUARIO O CORREO y CONTRASEÑA con iconos y ojo, "Recordarme en esta caja", "¿Olvidaste tu clave?", botón verde "Iniciar sesión →", "¿Aún no tienes cuenta? Registra tu minimarket gratis".

## 3. Stack técnico (el diseño debe poder implementarse así)
Angular 17+ (componentes standalone), Bootstrap 5, Angular Material (snackbar, inputs), Font Awesome 6, SweetAlert2 para alertas/confirmaciones, HTML+CSS plano por componente. Se prefiere **CSS con variables (design tokens)**; evitar depender de librerías nuevas pesadas.

## 4. Estructura general de la app
- **Layout autenticado**: barra lateral izquierda fija (≈264 px, oscura) + área de contenido con cabecera superior (nombre de la empresa, usuario, rol) + tarjeta de contenido.
- **Barra lateral**: logo de la empresa (o marca), menú con secciones desplegables (acordeón), ítem activo resaltado, botón "Cerrar sesión" abajo. El menú se **filtra por rol**.
- **Responsive**: en móvil/tablet la barra lateral debe colapsar en menú hamburguesa/drawer.
- Rutas públicas: `/login`, `/enviar-correo` (recuperar clave), `/reset-password?token=…`.

### Menú (secciones → pantallas)
1. **Administrable** (SUPERADMIN): Empresas, Sucursales, Roles.
2. **Dashboard** (ADMIN, SUPERVISOR, SUPERADMIN).
3. **Seguridad** (ADMIN, SUPERADMIN): Roles, Usuarios.
4. **Inventario** (ADMIN, ALMACENERO): Inventario, Inventario por producto, Movimientos de inventario (ajustes), Traslado de inventario.
5. **Almacenes** (ADMIN, ALMACENERO): Almacenes.
6. **Productos** (ADMIN, ALMACENERO): Unidades de medida, Tipos de producto, Categorías, Productos.
7. **Compras** (ADMIN, ALMACENERO): compras, proveedores.
8. **Ventas** (ADMIN, CAJERO, EMPRESA): Ventas, Cotizaciones, Clientes, Métodos de pago, Pagos, **Punto de venta (nueva venta)**.
9. **Delivery** (ADMIN, SUPERVISOR, CAJERO): Delivery.
10. **Caja** (ADMIN, CAJERO): Cajas, Apertura de caja (con transacciones/arqueo/cierre).
11. **Reportes** (ADMIN, CAJERO): Reporte de ventas, Reporte de almacenes.

## 5. Patrones de pantalla que se repiten (diseñar como componentes)
### 5.1 Pantalla de listado CRUD (≈25 pantallas: empresas, sucursales, roles, usuarios, productos, categorías, tipos, unidades, almacenes, inventario, ajustes, traslados, clientes, métodos de pago, cotizaciones, ventas, pagos, delivery, cajas…)
- Banner/encabezado de módulo opcional.
- Tarjeta con: título + contador ("12 registrados"), **buscador**, botón primario "+ Nuevo".
- **Tabla**: columnas con # de fila, datos, imagen/logo miniatura, columna **Acciones** (ver, editar, eliminar, PDF, transacciones según el módulo). Hover de fila, paginación numérica centrada, filtros opcionales (fechas, selects).
- Necesita: **estado vacío**, **cargando (skeleton)**, **insignias de estado** (Activo/Inactivo, Abierta/Cerrada, Pendiente/Pagada/Entregada), tabla scroll horizontal en móvil o transformada en tarjetas.
- **Modal de crear/editar**: título, formulario (inputs, selects, fecha, textarea, subir imagen/logo con preview), botones Cancelar / Guardar, validaciones en línea con mensajes claros.
- Confirmación de eliminar (SweetAlert) y toasts de éxito/error.

### 5.2 Formularios
Campos con label arriba, iconos opcionales, hint, error en rojo bajo el campo, estados foco/deshabilitado/error, agrupación por secciones en formularios largos (empresa, producto, cliente).

## 6. Pantallas clave en detalle

### 6.1 Dashboard
Saludo con nombre + fecha, botón "Nueva venta". Tarjetas KPI: ventas de hoy (S/ y # operaciones), ventas totales, clientes, productos. Lista de ventas recientes (comprobante, cliente, fecha, total). Accesos rápidos. **Mejorar con**: gráfico de ventas por día/semana, top productos, stock bajo, estado de caja (abierta/cerrada y saldo), ventas por método de pago.

### 6.2 Punto de venta (pantalla más importante, uso del cajero)
Layout a pantalla completa en dos paneles:
- **Izquierdo**: buscador de producto / escáner de código de barras, **tabs de categorías** (con imagen/icono), **grilla de productos** (tarjeta con imagen, nombre, precio, stock; clic = agregar al pedido; indicar sin stock).
- **Derecho (ticket/pedido)**: cliente seleccionado (buscar/crear cliente, "cliente general"), selector de comprobante (Boleta/Factura), tabla de ítems (producto, cantidad con +/−, precio, subtotal, quitar), notas, resumen (subtotal, descuento, **delivery**, **total** muy grande), check "Requiere delivery" (dirección, fecha de entrega, costo de envío), botones **"Cotizar"** y **"Cobrar"**.
- **Modal de cobro**: método de pago (Efectivo, Yape, Plin, Tarjeta) como botones grandes, monto recibido, **vuelto calculado**, confirmar. Éxito → opción de imprimir ticket PDF.
- **Aviso/estado de caja**: si no hay caja abierta, bloquear cobro y mostrar CTA "Abrir caja". Mostrar caja activa y cajero.
- Validaciones: stock insuficiente (mensaje claro), carrito vacío, cliente obligatorio.
- Debe ser usable con teclado y lector de barras; botones grandes para pantalla táctil.

### 6.3 Ventas (listado)
Tabla: fecha, tipo de comprobante, N° (B-000001 / F-000001), cliente, total. Acciones: ver detalle (modal con ítems, cliente, totales), descargar **PDF del comprobante**.

### 6.4 Cotizaciones
Listado con N° (COT-000001), cliente, fechas (emisión/vencimiento), estado (PENDIENTE/PAGADA), total; ver detalle; acción **pagar cotización** (convierte en venta).

### 6.5 Pagos
Registro de pago de una cotización: comprobante BOLETA/FACTURA, método de pago, monto pagado, caja abierta del cajero.

### 6.6 Clientes
Listado + formulario: tipo de documento (DNI 8 dígitos / RUC 11), búsqueda por **RENIEC** al ingresar DNI (autocompleta nombres), nombre, apellidos, dirección, teléfono, correo. Errores: documento duplicado, DNI/RUC inválido.

### 6.7 Caja (flujo crítico)
1. **Cajas**: lista de cajas por sucursal con estado (LIBRE / OCUPADA).
2. **Apertura**: elegir caja y monto inicial → crear apertura (estado ABIERTA).
3. **Detalle de apertura / Transacciones**: panel resumen (caja, cajero, hora de apertura, saldo inicial, saldo actual por método de pago), tabla de movimientos (INGRESO/EGRESO, método, monto, observación, hora), filtros por fecha/tipo, botones "Registrar ingreso/egreso" y "Transferir entre cajas".
4. **Arqueo y cierre**: el cajero ingresa el **monto contado**; el sistema compara con el efectivo del sistema y muestra la **diferencia** (verde si cuadra, rojo si no). Debe haber arqueo antes de cerrar. Resumen final del turno.
Reglas visibles en UI: no se puede egresar más que el saldo, no se mueve dinero con caja cerrada.

### 6.8 Delivery
Listado de envíos (dirección, fecha envío/entrega, encargado, costo, observaciones, estado Pendiente/En camino/Entregado) y edición de estado. Idealmente vista tipo tablero (kanban) además de tabla.

### 6.9 Productos e inventario
- **Productos**: imagen, nombre, descripción, categoría, unidad de medida, tipo (incluye productos por **peso**), precio de venta/costo, código de barras. 
- **Inventario / Inventario por producto**: stock actual por almacén con alerta visual de stock bajo.
- **Ajustes** (entradas/salidas con motivo), **Traslados** entre almacenes (origen → destino, producto, cantidad).
- **Almacenes**, **Categorías**, **Tipos de producto**, **Unidades de medida**: CRUDs simples.

### 6.10 Compras y proveedores
Registro de compra con detalle de productos, proveedor, comprobante, totales; CRUD de proveedores.

### 6.11 Seguridad y administración
- Usuarios (nombre, usuario, correo, contraseña, rol, sucursal, estado habilitado/deshabilitado), Roles, Módulos por rol.
- Empresas (razón social, RUC, ciudad, dirección, correo, fecha de registro, estado, **logo**), Sucursales (por empresa).

### 6.12 Reportes
- **Reporte de ventas**: filtros por rango de fechas/sucursal, tabla + totales + gráficos + exportar/imprimir.
- **Reporte de almacenes**: stock por almacén, rango de fechas, botón imprimir (versión optimizada para impresión).

### 6.13 Autenticación
Login (ver sección 2), recuperar clave (campo de correo → "Enviamos un enlace"), restablecer clave (nueva clave + confirmar, mínimo 6 caracteres, errores: token inválido/expirado). Mensajes: credenciales inválidas, usuario deshabilitado, sin permisos (403), sesión vencida.

## 7. Estados y mensajes a diseñar
Éxito, error, advertencia (SweetAlert/toasts); vacío ("Aún no hay …" + CTA); cargando (skeletons); sin permisos ("No tienes permisos para esta operación"); sesión vencida; validaciones de formulario; confirmación destructiva.

## 8. Entregables que quiero de la IA de diseño
1. **Design system**: tokens (color, tipografía, espaciado, radios, sombras), botones (primario/secundario/peligro/ghost/icono), inputs, selects, tablas, badges, tarjetas, modales, tabs, toasts, paginación, skeleton, empty state, avatar.
2. **Layout** de app (sidebar colapsable + topbar con búsqueda global, notificaciones y menú de usuario) en versión escritorio, tablet y móvil.
3. Pantallas completas: **Dashboard, Punto de venta (+ modal de cobro), Listado CRUD genérico (+ modal), Caja (apertura, movimientos, arqueo), Delivery, Reporte de ventas, Login/Recuperar clave**.
4. Modo claro (obligatorio) y, si es posible, modo oscuro.
5. Código limpio, semántico y accesible (contraste AA, foco visible, aria-labels, navegación por teclado), con **variables CSS** reutilizables.

## 9. Restricciones
- Idioma de la interfaz: **español (Perú)**; moneda `S/ 1,234.50`; fechas `dd/MM/yyyy`.
- Debe verse bien de 360 px a 1920 px.
- No inventar funciones fuera de las descritas; sí proponer mejoras de UX dentro de ellas.
- Mantener el estilo del login (verde esmeralda, limpio, esquinas redondeadas) como lenguaje visual base.
