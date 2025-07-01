import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DeliveryService } from '../../../../service/delivery.service';

@Component({
  selector: 'app-list-delivery',
  standalone: true,
  imports: [
    HeaderComponent,
    BarraLateralComponent,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './list-delivery.component.html',
  styleUrls: ['./list-delivery.component.css']
})
export class ListDeliveryComponent implements OnInit {
  deliverys: any[] = [];
  clientesFiltrados: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private dialog: MatDialog
  ) {}

 ngOnInit() {
  this.listarDelivery();
}


listarDelivery() {
  this.deliveryService.listarDelivery().subscribe({
    next: (data: any) => {
      this.deliverys = data || [];
      console.log("Lista de deliveries recibidos:", this.deliverys);
      this.buscarDelivery(); // Esto ya está bien
    },
    error: (err) => {
      Swal.fire("Error", "No se pudieron cargar los deliveries", "error");
      console.error(err);
    }
  });
}

buscarDelivery() {
  const filtro = this.filtroBusqueda.trim().toLowerCase();
  this.paginaActual = 1;

  let coincidencias = this.deliverys;

  if (filtro !== '') {
    coincidencias = this.deliverys.filter(m => {
      const valoresBusqueda = [
        m?.venta?.cliente?.nombre || '',
        m?.direccion || '',
        m?.fechaEnvio || '',
        m?.fechaEntrega || '',
        m?.observaciones || '',
        m?.encargado || '',
      ];

      return valoresBusqueda.some(valor =>
        valor.toString().toLowerCase().includes(filtro)
      );
    });
  }

  this.clientesFiltrados = coincidencias.slice(
    (this.paginaActual - 1) * this.elementosPorPagina,
    this.paginaActual * this.elementosPorPagina
  );
}


 actualizarPaginaFiltrada() {
  this.buscarDelivery(); // reutiliza la función principal
}


  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaFiltrada();
    }
  }

  paginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

get totalPaginas(): number {
  const filtro = this.filtroBusqueda.trim().toLowerCase();

  let coincidencias = this.deliverys;
  if (filtro !== '') {
    coincidencias = this.deliverys.filter(m => {
      const valoresBusqueda = [
        m?.venta?.cliente?.nombre,
        m?.direccion,
        m?.fechaEnvio,
        m?.fechaEntrega,
        m?.observaciones,
        m?.encargado,
      ];

      return valoresBusqueda.some(valor =>
        valor?.toString().toLowerCase().includes(filtro)
      );
    });
  }

  return Math.ceil(coincidencias.length / this.elementosPorPagina);
}


  eliminarCliente(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro de delivery',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deliveryService.eliminarDelivery(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El delivery ha sido eliminado',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => window.location.reload());
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el delivery', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  navegarYMostrarModal() {
    this.router.navigate(['admin/add-clientes']);
  }
}
