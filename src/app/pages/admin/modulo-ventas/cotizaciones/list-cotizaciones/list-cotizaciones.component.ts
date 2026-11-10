import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { PaginacionComponent } from '../../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../../components/paginacion/paginar.pipe';
import { CotizacionService } from '../../../../../service/cotizacion.service';
import { LoginService } from '../../../../../service/login.service';

@Component({
  selector: 'app-list-cotizaciones',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, HeaderComponent, RouterModule, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-cotizaciones.component.html',
  styleUrl: './list-cotizaciones.component.css'
})
export class ListCotizacionesComponent implements OnInit {
  cotizaciones: any[] = [];
  filtradas: any[] = [];
  filtroBusqueda = '';
  estadoFiltro = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  mostrarModalDetalle = false;
  detallesCotizacion: any[] = [];
  cotizacionSeleccionada: any = null;

  constructor(
    private cotizacionService: CotizacionService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.listarCotizaciones();
  }

  listarCotizaciones(): void {
    const sucursalId = this.loginService.getUser()?.sucursal?.idSucursal || 1;
    this.cargando = true;
    this.cotizacionService.listarCotizacionesPorSucursal(sucursalId).subscribe({
      next: (data: any) => {
        this.cotizaciones = (Array.isArray(data) ? data : []).sort((a: any, b: any) => String(b.fechaCotizacion).localeCompare(String(a.fechaCotizacion)));
        this.cargando = false;
        this.buscarCotizacion();
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar las cotizaciones', 'error');
      }
    });
  }

  estadoDe(c: any): string {
    return String(c?.estadoCotizacion || '').toUpperCase();
  }

  claseEstado(c: any): string {
    switch (this.estadoDe(c)) {
      case 'PAGADA': return 'ok';
      case 'PENDIENTE': return 'pendiente';
      default: return 'otro';
    }
  }

  get estados(): string[] {
    return [...new Set(this.cotizaciones.map(c => this.estadoDe(c)).filter(Boolean))];
  }

  get pendientes(): number {
    return this.cotizaciones.filter(c => this.estadoDe(c) === 'PENDIENTE').length;
  }

  get montoPendiente(): number {
    return this.cotizaciones.filter(c => this.estadoDe(c) === 'PENDIENTE').reduce((s, c) => s + Number(c.totalCotizacion || 0), 0);
  }

  nombreCliente(c: any): string {
    return `${c?.cliente?.nombre || ''} ${c?.cliente?.apellidos || ''}`.trim() || '—';
  }

  buscarCotizacion(): void {
    const t = this.filtroBusqueda.trim().toLowerCase();
    this.filtradas = this.cotizaciones.filter(c =>
      (!this.estadoFiltro || this.estadoDe(c) === this.estadoFiltro) &&
      (!t || [c.numeroCotizacion, c.cliente?.nombre, c.cliente?.apellidos, c.estadoCotizacion]
        .some(v => String(v ?? '').toLowerCase().includes(t)))
    );
  }

  verDetallesCotizacion(cotizacion: any): void {
    this.cotizacionSeleccionada = cotizacion;
    this.cotizacionService.obtenerDetallesPorCotizacion(cotizacion.idCotizaciones).subscribe({
      next: (detalles: any) => {
        this.detallesCotizacion = Array.isArray(detalles) ? detalles : [detalles];
        this.mostrarModalDetalle = true;
      },
      error: (err: any) => {
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar los detalles de la cotización', 'error');
      }
    });
  }

  cerrarDetalle(): void {
    this.mostrarModalDetalle = false;
  }

  eliminarCotizacion(cotizacionId: number): void {
    const cotizacion = this.cotizaciones.find(c => c.idCotizaciones === cotizacionId);
    if (this.estadoDe(cotizacion) === 'PAGADA') {
      Swal.fire('Acción no permitida', 'No puedes eliminar una cotización pagada.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Eliminar esta cotización?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.cotizacionService.eliminarCotizaciones(cotizacionId).subscribe({
        next: () => {
          Swal.fire('Eliminada', 'La cotización ha sido eliminada', 'success');
          this.listarCotizaciones();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          const cuerpo = err.error;
          Swal.fire('Error', (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'No se pudo eliminar la cotización', 'error');
        }
      });
    });
  }
}
