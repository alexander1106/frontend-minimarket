import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/AuthGuard';
import { ListMetodosPagoComponent } from './pages/metodos-pago/list-metodos-pago/list-metodos-pago.component';
import { AddMetodoPagoComponent } from './pages/metodos-pago/add-metodo-pago/add-metodo-pago.component';
import { AddVentasComponent } from './pages/ventas/add-ventas/add-ventas.component';
import { ListVentasComponent } from './pages/ventas/list-ventas/list-ventas.component';
import { AddCategoriasComponent } from './pages/productos/categorias/add-categorias/add-categorias.component';
import { ListCategoriasComponent } from './pages/productos/categorias/list-categorias/list-categorias.component';
import { UpdateCategoriasComponent } from './pages/productos/categorias/update-categorias/update-categorias.component';

export const routes: Routes = [
   {
  path:'',
  component:DashboardComponent
    },
  {
  path:'admin/metodos-pago',
  component:ListMetodosPagoComponent
    },
  { path: 'admin/add-metodos-pago', component: ListMetodosPagoComponent },
    {   path: 'admin/edit-metodos-pago/:id', component: ListMetodosPagoComponent },
        {   path: 'admin/list-venta', component: ListVentasComponent },


    {   path: 'admin/add-venta', component: AddVentasComponent },
    {   path: 'admin/add-categorias', component: AddCategoriasComponent },
    {   path: 'admin/list-categorias', component: ListCategoriasComponent },
    {   path: 'admin/list-categorias', component: UpdateCategoriasComponent },
    


];
