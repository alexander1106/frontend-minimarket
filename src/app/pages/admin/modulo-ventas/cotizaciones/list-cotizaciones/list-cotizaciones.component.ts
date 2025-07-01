import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CotizacionService } from '../../../../../service/cotizacion.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list-cotizaciones',
  imports: [HeaderComponent, RouterModule,BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-cotizaciones.component.html',
  styleUrl: './list-cotizaciones.component.css'
})
export class ListCotizacionesComponent implements OnInit {
  cotizaciones: any[] = [];
  cotizacionesFiltradas: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private cotizacionService: CotizacionService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.listarCotizaciones();
  }

  listarCotizaciones() {
    this.cotizacionService.listarCotizaciones().subscribe({
      next: (data: any) => {
        this.cotizaciones = data || [];
        this.buscarCotizacion();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar las cotizaciones", "error");
        console.error(err);
      }
    });
  }

  eliminarCotizacion(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la cotización permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cotizacionService.eliminarCotizaciones(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'La cotización ha sido eliminada',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.listarCotizaciones();
            });
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar la cotización', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  buscarCotizacion() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.cotizaciones;
    if (filtro !== '') {
      coincidencias = this.cotizaciones.filter(m =>
        (m?.cliente?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.estado?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id?.toString()?.includes(filtro) || false)
      );
    }

    this.cotizacionesFiltradas = coincidencias.slice(
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

    let coincidencias = this.cotizaciones;
    if (filtro !== '') {
      coincidencias = this.cotizaciones.filter(m =>
        (m?.cliente?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.estado?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id?.toString()?.includes(filtro) || false)
      );
    }

    this.cotizacionesFiltradas = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.cotizaciones;
    if (filtro !== '') {
      coincidencias = this.cotizaciones.filter(m =>
        (m?.cliente?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.estado?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }
}
