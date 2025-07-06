import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ListMetodosPagoComponent } from './pages/admin/modulo-ventas/metodos-pago/list-metodos-pago/list-metodos-pago.component';
import { ListVentasComponent } from './pages/admin/modulo-ventas/ventas/list-ventas/list-ventas.component';
import { AddVentasComponent } from './pages/admin/modulo-ventas/ventas/add-ventas/add-ventas.component';
import { ListClientesComponent } from './pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component';
import { AccessGuard } from './guards/AccessGuard';
import { ListDeliveryComponent } from './pages/admin/modulo-delivery/list-delivery/list-delivery.component';
import { ListCotizacionesComponent } from './pages/admin/modulo-ventas/cotizaciones/list-cotizaciones/list-cotizaciones.component';
import { ListCajaComponent } from './pages/admin/modulo-caja/caja/list-caja/list-caja.component';
import { AddCajaComponent } from './pages/admin/modulo-caja/caja/add-caja/add-caja.component';
import { ListAperturaComponent } from './pages/admin/modulo-caja/apertura/list-apertura/list-apertura.component';
import { ListTransaccionesComponent } from './pages/admin/modulo-caja/transacciones/list-transacciones/list-transacciones.component';
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
import { ReporteVentasComponent } from './pages/admin/reporte/reporte-ventas/reporte-ventas.component';
import { ReporteAlmacenesComponent} from './pages/admin/reporte/reporte-almacenes/reporte-almacenes.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AccessGuard] },

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
      {path: 'add-proveedores',component: ListClientesComponent },
      {path: 'list-delivery',component: ListDeliveryComponent },
      { path: 'edit-clientes/:id', component: ListClientesComponent },
      { path: 'view-clientes/:id', component: ListClientesComponent },
      { path: 'list-cotizaciones', component: ListCotizacionesComponent },
      //Cajas
      { path: 'list-cajas', component: ListCajaComponent },
      { path: 'add-caja', component: ListCajaComponent },
      { path: 'list-apertura', component: ListAperturaComponent },
      { path: 'list-transacciones/:idAperturaCaja', component: ListTransaccionesComponent },

      { path: 'empresas', component: ListEmpresasComponent },
      { path: 'add-empresas', component: ListEmpresasComponent },
      { path: 'edit-empresas/:id', component: ListEmpresasComponent },

      { path: 'sucursales', component: ListSucursalesComponent },
      { path: 'add-sucursales', component: ListSucursalesComponent },
      { path: 'edit-sucursales/:id', component: ListSucursalesComponent },

      { path: 'unidades-medida', component: ListUnidadesMedidaComponent },
      { path: 'add-unidad-medida', component: ListUnidadesMedidaComponent },
      { path: 'edit-unidad-medida/:id', component: ListUnidadesMedidaComponent },

      { path: 'tipoproducto', component: ListTipoProductoComponent },
      { path: 'add-tipoproducto', component: ListTipoProductoComponent },
      { path: 'edit-tipoproducto/:id', component: ListTipoProductoComponent },

      { path: 'categorias', component: ListCategoriasComponent },
      { path: 'add-categorias', component: ListCategoriasComponent },
      { path: 'edit-categorias/:id', component: ListCategoriasComponent },

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

      { path: 'roles', component: ListRolesComponent },
      { path: 'add-roles', component: ListRolesComponent },
      { path: 'edit-roles/:id', component: ListRolesComponent },

      { path: 'usuarios', component: ListUsuariosComponent },
      { path: 'usuarios/:id', component: ListUsuariosComponent },

      { path: 'add-usuarios', component: ListUsuariosComponent },
      { path: 'edit-roles/:id', component: ListUsuariosComponent },

      { path: 'empresas', component: ListEmpresasComponent },
      { path: 'add-empresas', component: ListEmpresasComponent },
      { path: 'edit-empresas/:id', component: ListEmpresasComponent },

      { path: 'sucursales', component: ListSucursalesComponent },
      { path: 'add-sucursales', component: ListSucursalesComponent },
      { path: 'edit-sucursales/:id', component: ListSucursalesComponent },
      { path: 'reporte-ventas', component: ReporteVentasComponent },
      { path: 'reporte-almacenes', component: ReporteAlmacenesComponent },

      // pagos
            { path: 'pagos', component: ListPagosComponent },

    ]
  },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' } // Wildcard para rutas no encontradas
];
