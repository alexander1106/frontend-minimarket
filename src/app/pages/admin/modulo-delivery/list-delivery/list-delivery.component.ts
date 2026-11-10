import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import { DeliveryService } from '../../../../service/delivery.service';

const ESTADOS = ['PENDIENTE', 'EN CAMINO', 'ENTREGADO', 'CANCELADO'];

@Component({
  selector: 'app-list-delivery',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-delivery.component.html',
  styleUrl: './list-delivery.component.css'
})
export class ListDeliveryComponent implements OnInit {
  deliverys: any[] = [];
  filtrados: any[] = [];
  filtroBusqueda = '';
  estadoFiltro = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  readonly estados = ESTADOS;

  editingDelivery: any = null;
  nuevoEstado = '';
  guardando = false;

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.listarDelivery();
  }

  listarDelivery(): void {
    this.cargando = true;
    this.deliveryService.listarDelivery().subscribe({
      next: (data: any) => {
        this.deliverys = (Array.isArray(data) ? data : []).sort((a: any, b: any) => String(b.fechaEnvio).localeCompare(String(a.fechaEnvio)));
        this.cargando = false;
        this.buscarDelivery();
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar los envíos', 'error');
      }
    });
  }

  estadoDe(d: any): string {
    return String(d?.estadoDelivery || '').toUpperCase();
  }

  claseEstado(d: any): string {
    switch (this.estadoDe(d)) {
      case 'ENTREGADO': return 'ok';
      case 'EN CAMINO': return 'camino';
      case 'CANCELADO': return 'cancelado';
      default: return 'pendiente';
    }
  }

  cuenta(estado: string): number {
    return this.deliverys.filter(d => this.estadoDe(d) === estado).length;
  }

  buscarDelivery(): void {
    const t = this.filtroBusqueda.trim().toLowerCase();
    this.filtrados = this.deliverys.filter(d =>
      (!this.estadoFiltro || this.estadoDe(d) === this.estadoFiltro) &&
      (!t || [d.venta?.cliente?.nombre, d.venta?.cliente?.apellidos, d.direccion, d.observaciones, d.encargado]
        .some(v => String(v ?? '').toLowerCase().includes(t)))
    );
  }

  nombreCliente(d: any): string {
    const c = d.venta?.cliente;
    return c ? `${c.nombre || ''} ${c.apellidos || ''}`.trim() || '—' : '—';
  }

  mostrarFormularioEditar(delivery: any): void {
    this.editingDelivery = delivery;
    this.nuevoEstado = this.estadoDe(delivery) || 'PENDIENTE';
  }

  cancelarEdicion(): void {
    this.editingDelivery = null;
  }

  guardarEstado(): void {
    const actualizado = {
      ...this.editingDelivery,
      estadoDelivery: this.nuevoEstado,
      idVenta: this.editingDelivery?.venta?.idventa
    };

    this.guardando = true;
    this.deliveryService.actualizarDelivery(this.editingDelivery.iddelivery, actualizado).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Actualizado', 'El estado del envío fue actualizado', 'success');
        this.editingDelivery = null;
        this.listarDelivery();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        Swal.fire('Error', (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'No se pudo actualizar el estado', 'error');
      }
    });
  }
}
