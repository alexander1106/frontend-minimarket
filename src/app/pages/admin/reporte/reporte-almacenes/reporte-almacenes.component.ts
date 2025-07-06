import { Component, OnInit } from '@angular/core';
import { AlmacenesService } from '../../../../service/almacenes.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarraLateralComponent } from "../../../../components/barra-lateral/barra-lateral.component";
import { HeaderComponent } from "../../../../components/header/header.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Almacen {
  idalmacen: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  encargado: string;
  estado: number;
  idsucursal: number;
  sucursalNombre?: string;
  fechaRegistro?: string;
}

interface Sucursal {
  idsucursal: number;
  nombre: string;
}

@Component({
  selector: 'app-reporte-almacenes',
  standalone: true,
  templateUrl: './reporte-almacenes.component.html',
  styleUrls: ['./reporte-almacenes.component.css'],
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent]
})
export class ReporteAlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  listaFiltradaTemporal: Almacen[] = []; // ✅ Lista filtrada temporal sin paginar
  filtrados: Almacen[] = [];             // ✅ Lista que se muestra con paginación
  sucursales: Sucursal[] = [];
  filtro = '';
  sucursalFiltro: number = 0;
  fechaInicio: string = '';
  fechaFin: string = '';

  // ✅ Paginación
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private svc: AlmacenesService,
    private sucSvc: SucursalesService
  ) {}

  ngOnInit(): void {
    this.cargarSucursalesYAlmacenes();
  }

  private cargarSucursalesYAlmacenes(): void {
    this.sucSvc.listarSucursales().subscribe({
      next: sucursales => {
        this.sucursales = sucursales.map((s: any) => ({
          idsucursal: Number(s.idsucursal ?? s.id_sucursal ?? s.idSucursal),
          nombre: s.nombre ?? s.nombreSucursal ?? 'Sin nombre'
        }));

        this.svc.listarAlmacenes().subscribe({
          next: almacenes => {
            this.almacenes = almacenes.map((a: any) => {
              const sid = Number(a.idsucursal ?? a.idSucursal ?? 0);
              const suc = this.sucursales.find(s => s.idsucursal === sid);
              return {
                idalmacen: a.idalmacen,
                nombre: a.nombre,
                descripcion: a.descripcion,
                direccion: a.direccion,
                encargado: a.encargado,
                estado: a.estado,
                idsucursal: sid,
                sucursalNombre: suc ? suc.nombre : '—',
                fechaRegistro: a.fechaRegistro ?? a.fechaCreacion ?? ''
              } as Almacen;
            });
            this.aplicarFiltro();
          },
          error: () => Swal.fire('Error', 'No se pudieron cargar almacenes', 'error')
        });
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar sucursales', 'error')
    });
  }

  aplicarFiltro(): void {
    let list = this.almacenes;

    const t = this.filtro.trim().toLowerCase();
    if (t) {
      list = list.filter(a =>
        a.nombre.toLowerCase().includes(t) ||
        a.descripcion.toLowerCase().includes(t) ||
        a.direccion.toLowerCase().includes(t) ||
        a.encargado.toLowerCase().includes(t) ||
        (a.sucursalNombre ?? '').toLowerCase().includes(t)
      );
    }

    if (this.sucursalFiltro !== 0) {
      list = list.filter(a => a.idsucursal === this.sucursalFiltro);
    }

    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);

      list = list.filter(a => {
        if (!a.fechaRegistro) return false;
        const fecha = new Date(a.fechaRegistro);
        return fecha >= inicio && fecha <= fin;
      });
    }

    this.listaFiltradaTemporal = list;
    this.cambiarPagina(1); // Reiniciar a la primera página después de aplicar filtro
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    const end = start + this.elementosPorPagina;
    this.filtrados = this.listaFiltradaTemporal.slice(start, end);
  }

  get totalPaginas(): number {
    return Math.ceil(this.listaFiltradaTemporal.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    doc.text('Reporte de Almacenes', 14, 15);
    autoTable(doc, {
      head: [['Nombre', 'Descripción', 'Dirección', 'Encargado', 'Estado', 'Sucursal', 'Fecha Registro']],
      body: this.listaFiltradaTemporal.map(a => [
        a.nombre,
        a.descripcion,
        a.direccion,
        a.encargado,
        a.estado === 1 ? 'Activo' : 'Inactivo',
        a.sucursalNombre ?? '—',
        a.fechaRegistro ? new Date(a.fechaRegistro).toLocaleDateString() : '—'
      ]),
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('reporte-almacenes.pdf');
  }

  imprimir(): void {
    window.print();
  }
}