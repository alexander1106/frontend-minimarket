import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { VentasService } from '../../../../service/ventas.service';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, CommonModule, RouterModule, FormsModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './reporte-ventas.component.html',
  styleUrls: ['./reporte-ventas.component.css']
})
export class ReporteVentasComponent implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  filtroCliente = '';
  tipoFiltro = '';
  desde = '';
  hasta = '';
  isLoading = true;

  pagina = 1;
  porPagina = 5;

  ventaSeleccionada: any = null;
  mostrarModal = false;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.isLoading = true;
    this.ventasService.listarVentas().subscribe({
      next: (data: any) => {
        this.ventas = (Array.isArray(data) ? data : []).sort((a: any, b: any) => String(b.fecha_venta).localeCompare(String(a.fecha_venta)));
        this.isLoading = false;
        this.aplicarFiltros();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar las ventas', 'error');
      }
    });
  }

  get tipos(): string[] {
    return [...new Set(this.ventas.map(v => v.tipo_comprobante).filter(Boolean))] as string[];
  }

  aplicarFiltros(): void {
    const t = this.filtroCliente.trim().toLowerCase();
    this.ventasFiltradas = this.ventas.filter(v => {
      const dia = String(v.fecha_venta || '').slice(0, 10);
      const cliente = `${v.cliente?.nombre || ''} ${v.cliente?.apellidos || ''}`.toLowerCase();
      return (!t || cliente.includes(t) || String(v.nro_comrprobante || '').toLowerCase().includes(t))
        && (!this.tipoFiltro || v.tipo_comprobante === this.tipoFiltro)
        && (!this.desde || dia >= this.desde)
        && (!this.hasta || dia <= this.hasta);
    });
    this.pagina = 1;
  }

  limpiarFiltros(): void {
    this.filtroCliente = '';
    this.tipoFiltro = '';
    this.desde = '';
    this.hasta = '';
    this.aplicarFiltros();
  }

  get totalVendido(): number {
    return this.ventasFiltradas.reduce((s, v) => s + Number(v.total_venta || 0), 0);
  }

  get promedio(): number {
    return this.ventasFiltradas.length ? this.totalVendido / this.ventasFiltradas.length : 0;
  }

  nombreCliente(v: any): string {
    return `${v?.cliente?.nombre || ''} ${v?.cliente?.apellidos || ''}`.trim() || '—';
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
      next: data => {
        const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
        window.open(url);
      },
      error: (err: any) => {
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudo descargar el PDF de la venta', 'error');
      }
    });
  }

  exportarCSV(): void {
    if (!this.ventasFiltradas.length) return;
    const filas = [['Fecha', 'Comprobante', 'Número', 'Cliente', 'Total']].concat(
      this.ventasFiltradas.map(v => [
        String(v.fecha_venta || '').slice(0, 10), v.tipo_comprobante || '', v.nro_comrprobante || '',
        this.nombreCliente(v), Number(v.total_venta || 0).toFixed(2)
      ])
    );
    const csv = '﻿' + filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-ventas.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  imprimir(): void {
    window.print();
  }
}
