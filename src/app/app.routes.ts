import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { EnviarCorreoComponent } from './pages/recuperar-clave/enviar-correo.component';
import { ResetPasswordComponent } from './pages/recuperar-clave/reset-password.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ListMetodosPagoComponent } from './pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component';
import { ListVentasComponent } from './pages/admin/modulo-ventas/ventas/list-ventas/list-ventas.component';
import { AddVentasComponent } from './pages/admin/modulo-ventas/ventas/add-ventas/add-ventas.component';
import { ListClientesComponent } from './pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component';
import { AccessGuard } from './guards/AccessGuard';
import { SuperadminGuard } from './guards/SuperadminGuard';
import { ListDeliveryComponent } from './pages/admin/modulo-delivery/list-delivery/list-delivery.component';
import { ListCotizacionesComponent } from './pages/admin/modulo-ventas/cotizaciones/list-cotizaciones/list-cotizaciones.component';
import { ListCajaComponent } from './pages/admin/modulo-caja/caja/list-caja/list-caja.component';
import { AddCajaComponent } from './pages/admin/modulo-caja/caja/add-caja/add-caja.component';
import { ListAperturaComponent } from './pages/admin/modulo-caja/apertura/list-apertura/list-apertura.component';
import { ListTransaccionesComponent } from './pages/admin/modulo-caja/transacciones/list-transacciones/list-transacciones.component';
import { PerfilComponent } from './pages/admin/perfil/perfil.component';
import { AuditoriaComponent } from './pages/admin/auditoria/auditoria.component';
import { NotificacionesComponent } from './pages/admin/notificaciones/notificaciones.component';
import { ListEmpresasComponent } from './pages/admin/administrable/empresas/list-empresas.component';
import { ListUnidadesMedidaComponent } from './pages/admin/productos/unidades-medida/list-unidades-medida.component';
import { ListTipoProductoComponent } from './pages/admin/productos/tipoproducto/list-tipo-producto.component';
import { ListCategoriasComponent } from './pages/admin/productos/categorias/list-categorias.component';
import { ListProductosComponent } from './pages/admin/productos/productos/list-productos.component';
import { ListAlmacenesComponent } from './pages/admin/almacenes/almacenes/list-almacenes.component';
import { ListInventarioComponent } from './pages/admin/inventario/inventario/list-inventario.component';
import { ListInventarioProductoComponent } from './pages/admin/inventario/inventarioproducto/list-inventarioproducto.component';
import { ListAjusteInventarioComponent } from './pages/admin/inventario/ajusteinventario/list-ajuste-inventario.component';
import { ListTrasladoInventarioProductoComponent } from './pages/admin/inventario/trasladoinventarioproducto/list-traslado-inventarioproducto.component';
import { ListRolesComponent } from './pages/admin/seguridad/roles/list-roles.component';
import { ListUsuariosComponent } from './pages/admin/seguridad/usuarios/list-usuarios.component';
import { ListSucursalesComponent } from './pages/admin/administrable/sucursales/list-sucursales.component';
import { ListPagosComponent } from './pages/admin/modulo-ventas/list-pagos/list-pagos.component';
import { ListComprasComponent } from './pages/admin/compras/compras/list-compras.component';
import { FormCompraComponent } from './pages/admin/compras/compras/form-compra.component';
import { KardexComponent } from './pages/admin/inventario/kardex/kardex.component';
import { ListMetodosPagoCatalogoComponent } from './pages/admin/administrable/metodos-pago-catalogo/list-metodos-pago-catalogo.component';
import { ListPlanesComponent } from './pages/admin/administrable/planes/list-planes.component';
import { ListProveedoresComponent } from './pages/admin/compras/proveedores/list-proveedores.component';
import { ReporteVentasComponent } from './pages/admin/reporte/reporte-ventas/reporte-ventas.component';
import { ReporteAlmacenesComponent} from './pages/admin/reporte/reporte-almacenes/reporte-almacenes.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AccessGuard] },
  { path: 'enviar-correo', component: EnviarCorreoComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: 'admin',
    canActivate: [AccessGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'metodos-pago', component: ListMetodosPagoComponent },
      { path: 'add-metodos-pago', component: ListMetodosPagoComponent },
      { path: 'edit-metodos-pago/:id', component: ListMetodosPagoComponent },
      { path: 'ver-metodos-pago/:id', component: ListMetodosPagoComponent },

      { path: 'list-venta', component: ListVentasComponent },
      { path: 'add-venta', component: AddVentasComponent },
      { path: 'list-clientes', component: ListClientesComponent },
      {path: 'add-clientes',component: ListClientesComponent },
      {path: 'list-delivery',component: ListDeliveryComponent },
      { path: 'edit-clientes/:id', component: ListClientesComponent },
      { path: 'view-clientes/:id', component: ListClientesComponent },
      { path: 'list-cotizaciones', component: ListCotizacionesComponent },
      { path: 'list-cajas', component: ListCajaComponent },
      { path: 'add-caja', component: ListCajaComponent },
      { path: 'list-apertura', component: ListAperturaComponent },
      { path: 'list-transacciones/:idAperturaCaja', component: ListTransaccionesComponent },

      { path: 'empresas', component: ListEmpresasComponent, canActivate: [SuperadminGuard] },
      { path: 'add-empresas', component: ListEmpresasComponent },
      { path: 'edit-empresas/:id', component: ListEmpresasComponent },

      { path: 'sucursales', component: ListSucursalesComponent, canActivate: [SuperadminGuard] },
      { path: 'add-sucursales', component: ListSucursalesComponent },
      { path: 'edit-sucursales/:id', component: ListSucursalesComponent },

      { path: 'unidades-medida', component: ListUnidadesMedidaComponent, canActivate: [SuperadminGuard] },
      { path: 'add-unidad-medida', component: ListUnidadesMedidaComponent },
      { path: 'edit-unidad-medida/:id', component: ListUnidadesMedidaComponent },

      { path: 'tipoproducto', component: ListTipoProductoComponent, canActivate: [SuperadminGuard] },
      { path: 'add-tipoproducto', component: ListTipoProductoComponent, canActivate: [SuperadminGuard] },
      { path: 'edit-tipoproducto/:id', component: ListTipoProductoComponent, canActivate: [SuperadminGuard] },

      { path: 'categorias', component: ListCategoriasComponent, canActivate: [SuperadminGuard] },
      { path: 'add-categorias', component: ListCategoriasComponent, canActivate: [SuperadminGuard] },
      { path: 'edit-categorias/:id', component: ListCategoriasComponent, canActivate: [SuperadminGuard] },

      { path: 'productos', component: ListProductosComponent },
      { path: 'add-productos', component: ListProductosComponent },
      { path: 'edit-productos/:id', component: ListProductosComponent },

      { path: 'almacenes', component: ListAlmacenesComponent },
      { path: 'add-almacenes', component: ListAlmacenesComponent },
      { path: 'edit-almacenes/:id', component: ListAlmacenesComponent },

      { path: 'inventario', component: ListInventarioComponent },
      { path: 'add-inventario', component: ListInventarioComponent },
      { path: 'edit-inventario/:id', component: ListInventarioComponent },

      { path: 'inventarioproducto', component: ListInventarioProductoComponent },
      { path: 'add-inventarioproducto', component: ListInventarioProductoComponent },
      { path: 'edit-inventarioproducto/:id', component: ListInventarioProductoComponent },

      { path: 'ajuste-inventario', component: ListAjusteInventarioComponent },
      { path: 'add-ajuste-inventario', component: ListAjusteInventarioComponent },
      { path: 'edit-ajuste-inventario/:id', component: ListAjusteInventarioComponent },

      { path: 'traslado-inventario-producto', component: ListTrasladoInventarioProductoComponent },
      { path: 'add-traslado-inventario-producto', component: ListTrasladoInventarioProductoComponent },
      { path: 'edit-traslado-inventario-producto/:id', component: ListTrasladoInventarioProductoComponent },

      { path: 'kardex', component: KardexComponent },
      { path: 'metodos-pago-catalogo', component: ListMetodosPagoCatalogoComponent, canActivate: [SuperadminGuard] },
      { path: 'planes', component: ListPlanesComponent, canActivate: [SuperadminGuard] },
      { path: 'compras', component: ListComprasComponent },
      { path: 'list-compras', redirectTo: 'compras', pathMatch: 'full' },
      { path: 'compras/nueva', component: FormCompraComponent },
      { path: 'compras/editar/:id', component: FormCompraComponent },
      { path: 'proveedores', component: ListProveedoresComponent },
      { path: 'roles', component: ListRolesComponent, canActivate: [SuperadminGuard] },
      { path: 'add-roles', component: ListRolesComponent, canActivate: [SuperadminGuard] },
      { path: 'edit-roles/:id', component: ListRolesComponent, canActivate: [SuperadminGuard] },

      { path: 'usuarios', component: ListUsuariosComponent },
      { path: 'usuarios/:id', component: ListUsuariosComponent },

      { path: 'add-usuarios', component: ListUsuariosComponent },
      { path: 'edit-roles/:id', component: ListUsuariosComponent, canActivate: [SuperadminGuard] },

      { path: 'empresas', component: ListEmpresasComponent, canActivate: [SuperadminGuard] },
      { path: 'add-empresas', component: ListEmpresasComponent },
      { path: 'edit-empresas/:id', component: ListEmpresasComponent },

      { path: 'sucursales', component: ListSucursalesComponent, canActivate: [SuperadminGuard] },
      { path: 'add-sucursales', component: ListSucursalesComponent },
      { path: 'edit-sucursales/:id', component: ListSucursalesComponent },
      { path: 'reporte-ventas', component: ReporteVentasComponent },
      { path: 'reporte-almacenes', component: ReporteAlmacenesComponent },

      { path: 'pagos', component: ListPagosComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'auditoria', component: AuditoriaComponent, canActivate: [SuperadminGuard] },

    ]
  },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' }
];
