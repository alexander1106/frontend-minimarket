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
import { ListSucursalesComponent } from './pages/admin/administrable/sucursales/list-sucursales.component';


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
    ]
  },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' } // Wildcard para rutas no encontradas
];
