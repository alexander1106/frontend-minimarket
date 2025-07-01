import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AddClienteComponent } from '../../modulo-ventas/clientes/add-cliente/add-cliente.component';
import { ClientesService } from '../../../../service/clientes.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { DeliveryService } from '../../../../service/delivery.service';

@Component({
  selector: 'app-list-delivery',
  imports: [HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-delivery.component.html',
  styleUrl: './list-delivery.component.css'
})
export class ListDeliveryComponent {
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

    // Abrir modal si entramos directamente a /admin/add-clientes
    if (this.router.url.endsWith('/add-clientes')) {
      this.abrirModalNuevoCliente();
    }
    console.log("sd" +this.listarDelivery)
  }

  abrirModalNuevoCliente() {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '1200px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.listarDelivery();
      }

      // Asegura que el modal se cierre completamente antes de redirigir
      setTimeout(() => {
        this.router.navigate(['/admin/list-clientes']);
      }, 0);
    });
  }

eliminarCliente(id: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará al cliente permanentemente',
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
            text: 'El delivery a sido eliminado ha sido eliminado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.reload(); // ✅ recarga la página completamente
          });
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
          console.error(err);
        }
      });
    }
  });
}


  listarDelivery() {
    this.deliveryService.listarDelivery().subscribe({
      next: (data: any) => {
        this.deliverys = data || [];
        this.buscarDelivery();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
        console.error(err);
      }
    });
  }

  buscarDelivery() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.deliverys;
    if (filtro !== '') {
      coincidencias = this.deliverys.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_cliente?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaFiltrada();
    }
  }

  paginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }

  actualizarPaginaFiltrada() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.deliverys;
    if (filtro !== '') {
      coincidencias = this.deliverys.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.deliverys;
    if (filtro !== '') {
      coincidencias = this.deliverys.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }



  navegarYMostrarModal() {
    this.router.navigate(['admin/add-clientes']);
  }
}
