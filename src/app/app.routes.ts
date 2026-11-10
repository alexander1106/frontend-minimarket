import { Routes } from '@angular/router';

import { AccessGuard } from './guards/AccessGuard';
import { SuperadminGuard } from './guards/SuperadminGuard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [AccessGuard] },
  { path: 'enviar-correo', loadComponent: () => import('./pages/recuperar-clave/enviar-correo.component').then(m => m.EnviarCorreoComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/recuperar-clave/reset-password.component').then(m => m.ResetPasswordComponent) },

  {
    path: 'admin',
    canActivate: [AccessGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'metodos-pago', loadComponent: () => import('./pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component').then(m => m.ListMetodosPagoComponent) },
      { path: 'add-metodos-pago', loadComponent: () => import('./pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component').then(m => m.ListMetodosPagoComponent) },
      { path: 'edit-metodos-pago/:id', loadComponent: () => import('./pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component').then(m => m.ListMetodosPagoComponent) },
      { path: 'ver-metodos-pago/:id', loadComponent: () => import('./pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component').then(m => m.ListMetodosPagoComponent) },

      { path: 'list-venta', loadComponent: () => import('./pages/admin/modulo-ventas/ventas/list-ventas/list-ventas.component').then(m => m.ListVentasComponent) },
      { path: 'add-venta', loadComponent: () => import('./pages/admin/modulo-ventas/ventas/add-ventas/add-ventas.component').then(m => m.AddVentasComponent) },
      { path: 'list-clientes', loadComponent: () => import('./pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component').then(m => m.ListClientesComponent) },
      {path: 'add-clientes',loadComponent: () => import('./pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component').then(m => m.ListClientesComponent) },
      {path: 'list-delivery',loadComponent: () => import('./pages/admin/modulo-delivery/list-delivery/list-delivery.component').then(m => m.ListDeliveryComponent) },
      { path: 'edit-clientes/:id', loadComponent: () => import('./pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component').then(m => m.ListClientesComponent) },
      { path: 'view-clientes/:id', loadComponent: () => import('./pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component').then(m => m.ListClientesComponent) },
      { path: 'list-cotizaciones', loadComponent: () => import('./pages/admin/modulo-ventas/cotizaciones/list-cotizaciones/list-cotizaciones.component').then(m => m.ListCotizacionesComponent) },
      { path: 'list-cajas', loadComponent: () => import('./pages/admin/modulo-caja/caja/list-caja/list-caja.component').then(m => m.ListCajaComponent) },
      { path: 'add-caja', loadComponent: () => import('./pages/admin/modulo-caja/caja/list-caja/list-caja.component').then(m => m.ListCajaComponent) },
      { path: 'list-apertura', loadComponent: () => import('./pages/admin/modulo-caja/apertura/list-apertura/list-apertura.component').then(m => m.ListAperturaComponent) },
      { path: 'list-transacciones/:idAperturaCaja', loadComponent: () => import('./pages/admin/modulo-caja/transacciones/list-transacciones/list-transacciones.component').then(m => m.ListTransaccionesComponent) },

      { path: 'empresas', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent), canActivate: [SuperadminGuard] },
      { path: 'add-empresas', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent) },
      { path: 'edit-empresas/:id', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent) },

      { path: 'sucursales', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent), canActivate: [SuperadminGuard] },
      { path: 'add-sucursales', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent) },
      { path: 'edit-sucursales/:id', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent) },

      { path: 'unidades-medida', loadComponent: () => import('./pages/admin/productos/unidades-medida/list-unidades-medida.component').then(m => m.ListUnidadesMedidaComponent), canActivate: [SuperadminGuard] },
      { path: 'add-unidad-medida', loadComponent: () => import('./pages/admin/productos/unidades-medida/list-unidades-medida.component').then(m => m.ListUnidadesMedidaComponent) },
      { path: 'edit-unidad-medida/:id', loadComponent: () => import('./pages/admin/productos/unidades-medida/list-unidades-medida.component').then(m => m.ListUnidadesMedidaComponent) },

      { path: 'tipoproducto', loadComponent: () => import('./pages/admin/productos/tipoproducto/list-tipo-producto.component').then(m => m.ListTipoProductoComponent), canActivate: [SuperadminGuard] },
      { path: 'add-tipoproducto', loadComponent: () => import('./pages/admin/productos/tipoproducto/list-tipo-producto.component').then(m => m.ListTipoProductoComponent), canActivate: [SuperadminGuard] },
      { path: 'edit-tipoproducto/:id', loadComponent: () => import('./pages/admin/productos/tipoproducto/list-tipo-producto.component').then(m => m.ListTipoProductoComponent), canActivate: [SuperadminGuard] },

      { path: 'categorias', loadComponent: () => import('./pages/admin/productos/categorias/list-categorias.component').then(m => m.ListCategoriasComponent), canActivate: [SuperadminGuard] },
      { path: 'add-categorias', loadComponent: () => import('./pages/admin/productos/categorias/list-categorias.component').then(m => m.ListCategoriasComponent), canActivate: [SuperadminGuard] },
      { path: 'edit-categorias/:id', loadComponent: () => import('./pages/admin/productos/categorias/list-categorias.component').then(m => m.ListCategoriasComponent), canActivate: [SuperadminGuard] },

      { path: 'productos', loadComponent: () => import('./pages/admin/productos/productos/list-productos.component').then(m => m.ListProductosComponent) },
      { path: 'add-productos', loadComponent: () => import('./pages/admin/productos/productos/list-productos.component').then(m => m.ListProductosComponent) },
      { path: 'edit-productos/:id', loadComponent: () => import('./pages/admin/productos/productos/list-productos.component').then(m => m.ListProductosComponent) },

      { path: 'almacenes', loadComponent: () => import('./pages/admin/almacenes/almacenes/list-almacenes.component').then(m => m.ListAlmacenesComponent) },
      { path: 'add-almacenes', loadComponent: () => import('./pages/admin/almacenes/almacenes/list-almacenes.component').then(m => m.ListAlmacenesComponent) },
      { path: 'edit-almacenes/:id', loadComponent: () => import('./pages/admin/almacenes/almacenes/list-almacenes.component').then(m => m.ListAlmacenesComponent) },

      { path: 'inventario', loadComponent: () => import('./pages/admin/inventario/inventario/list-inventario.component').then(m => m.ListInventarioComponent) },
      { path: 'add-inventario', loadComponent: () => import('./pages/admin/inventario/inventario/list-inventario.component').then(m => m.ListInventarioComponent) },
      { path: 'edit-inventario/:id', loadComponent: () => import('./pages/admin/inventario/inventario/list-inventario.component').then(m => m.ListInventarioComponent) },

      { path: 'inventarioproducto', loadComponent: () => import('./pages/admin/inventario/inventarioproducto/list-inventarioproducto.component').then(m => m.ListInventarioProductoComponent) },
      { path: 'add-inventarioproducto', loadComponent: () => import('./pages/admin/inventario/inventarioproducto/list-inventarioproducto.component').then(m => m.ListInventarioProductoComponent) },
      { path: 'edit-inventarioproducto/:id', loadComponent: () => import('./pages/admin/inventario/inventarioproducto/list-inventarioproducto.component').then(m => m.ListInventarioProductoComponent) },

      { path: 'ajuste-inventario', loadComponent: () => import('./pages/admin/inventario/ajusteinventario/list-ajuste-inventario.component').then(m => m.ListAjusteInventarioComponent) },
      { path: 'add-ajuste-inventario', loadComponent: () => import('./pages/admin/inventario/ajusteinventario/list-ajuste-inventario.component').then(m => m.ListAjusteInventarioComponent) },
      { path: 'edit-ajuste-inventario/:id', loadComponent: () => import('./pages/admin/inventario/ajusteinventario/list-ajuste-inventario.component').then(m => m.ListAjusteInventarioComponent) },

      { path: 'traslado-inventario-producto', loadComponent: () => import('./pages/admin/inventario/trasladoinventarioproducto/list-traslado-inventarioproducto.component').then(m => m.ListTrasladoInventarioProductoComponent) },
      { path: 'add-traslado-inventario-producto', loadComponent: () => import('./pages/admin/inventario/trasladoinventarioproducto/list-traslado-inventarioproducto.component').then(m => m.ListTrasladoInventarioProductoComponent) },
      { path: 'edit-traslado-inventario-producto/:id', loadComponent: () => import('./pages/admin/inventario/trasladoinventarioproducto/list-traslado-inventarioproducto.component').then(m => m.ListTrasladoInventarioProductoComponent) },

      { path: 'kardex', loadComponent: () => import('./pages/admin/inventario/kardex/kardex.component').then(m => m.KardexComponent) },
      { path: 'metodos-pago-catalogo', loadComponent: () => import('./pages/admin/administrable/metodos-pago-catalogo/list-metodos-pago-catalogo.component').then(m => m.ListMetodosPagoCatalogoComponent), canActivate: [SuperadminGuard] },
      { path: 'planes', loadComponent: () => import('./pages/admin/administrable/planes/list-planes.component').then(m => m.ListPlanesComponent), canActivate: [SuperadminGuard] },
      { path: 'compras', loadComponent: () => import('./pages/admin/compras/compras/list-compras.component').then(m => m.ListComprasComponent) },
      { path: 'list-compras', redirectTo: 'compras', pathMatch: 'full' },
      { path: 'compras/nueva', loadComponent: () => import('./pages/admin/compras/compras/form-compra.component').then(m => m.FormCompraComponent) },
      { path: 'compras/editar/:id', loadComponent: () => import('./pages/admin/compras/compras/form-compra.component').then(m => m.FormCompraComponent) },
      { path: 'proveedores', loadComponent: () => import('./pages/admin/compras/proveedores/list-proveedores.component').then(m => m.ListProveedoresComponent) },
      { path: 'roles', loadComponent: () => import('./pages/admin/seguridad/roles/list-roles.component').then(m => m.ListRolesComponent), canActivate: [SuperadminGuard] },
      { path: 'add-roles', loadComponent: () => import('./pages/admin/seguridad/roles/list-roles.component').then(m => m.ListRolesComponent), canActivate: [SuperadminGuard] },
      { path: 'edit-roles/:id', loadComponent: () => import('./pages/admin/seguridad/roles/list-roles.component').then(m => m.ListRolesComponent), canActivate: [SuperadminGuard] },

      { path: 'usuarios', loadComponent: () => import('./pages/admin/seguridad/usuarios/list-usuarios.component').then(m => m.ListUsuariosComponent) },
      { path: 'usuarios/:id', loadComponent: () => import('./pages/admin/seguridad/usuarios/list-usuarios.component').then(m => m.ListUsuariosComponent) },

      { path: 'add-usuarios', loadComponent: () => import('./pages/admin/seguridad/usuarios/list-usuarios.component').then(m => m.ListUsuariosComponent) },
      { path: 'edit-roles/:id', loadComponent: () => import('./pages/admin/seguridad/usuarios/list-usuarios.component').then(m => m.ListUsuariosComponent), canActivate: [SuperadminGuard] },

      { path: 'empresas', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent), canActivate: [SuperadminGuard] },
      { path: 'add-empresas', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent) },
      { path: 'edit-empresas/:id', loadComponent: () => import('./pages/admin/administrable/empresas/list-empresas.component').then(m => m.ListEmpresasComponent) },

      { path: 'sucursales', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent), canActivate: [SuperadminGuard] },
      { path: 'add-sucursales', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent) },
      { path: 'edit-sucursales/:id', loadComponent: () => import('./pages/admin/administrable/sucursales/list-sucursales.component').then(m => m.ListSucursalesComponent) },
      { path: 'reporte-ventas', loadComponent: () => import('./pages/admin/reporte/reporte-ventas/reporte-ventas.component').then(m => m.ReporteVentasComponent) },
      { path: 'reporte-almacenes', loadComponent: () => import('./pages/admin/reporte/reporte-almacenes/reporte-almacenes.component').then(m => m.ReporteAlmacenesComponent) },

      { path: 'pagos', loadComponent: () => import('./pages/admin/modulo-ventas/list-pagos/list-pagos.component').then(m => m.ListPagosComponent) },
      { path: 'notificaciones', loadComponent: () => import('./pages/admin/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent) },
      { path: 'perfil', loadComponent: () => import('./pages/admin/perfil/perfil.component').then(m => m.PerfilComponent) },
      { path: 'auditoria', loadComponent: () => import('./pages/admin/auditoria/auditoria.component').then(m => m.AuditoriaComponent), canActivate: [SuperadminGuard] },

    ]
  },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' }
];
