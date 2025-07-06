import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VentasService } from '../../../../service/ventas.service';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { DomSanitizer } from '@angular/platform-browser'; // Para PDF

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './reporte-ventas.component.html',
  styleUrls: ['./reporte-ventas.component.css']
})
export class ReporteVentasComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  filtroCliente: string = '';
  filtroFecha: string = '';
  isLoading = true;

  // Paginación
  paginaActual = 1;
  ventasPorPagina = 10;

  // Modal detalle
  ventaSeleccionada: any = null;
  mostrarModal = false;

  constructor(
    private ventasService: VentasService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.ventasService.listarVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.ventasFiltradas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar ventas', err);
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.ventasFiltradas = this.ventas.filter(v => {
      const clienteNombre = v.cliente?.nombre?.toLowerCase() || '';
      const coincideCliente = this.filtroCliente === '' || clienteNombre.includes(this.filtroCliente.toLowerCase());
      const coincideFecha = this.filtroFecha === '' || v.fecha_venta?.startsWith(this.filtroFecha);
      return coincideCliente && coincideFecha;
    });
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.filtroFecha = '';
    this.ventasFiltradas = this.ventas;
    this.paginaActual = 1;
  }

  get ventasPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.ventasPorPagina;
    const fin = inicio + this.ventasPorPagina;
    return this.ventasFiltradas.slice(inicio, fin);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    const totalPaginas = Math.ceil(this.ventasFiltradas.length / this.ventasPorPagina);
    if (this.paginaActual < totalPaginas) {
      this.paginaActual++;
    }
  }

  verDetalle(venta: any): void {
    this.ventaSeleccionada = venta;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  descargarPDF(venta: any): void {
    this.ventasService.descargarPDF(venta.idVenta).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => {
        console.error('Error al descargar PDF', err);
      }
    });
  }
}
