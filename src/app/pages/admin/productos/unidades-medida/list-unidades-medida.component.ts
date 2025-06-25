import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { UnidadMedidaService } from '../../../../service/unidad-medida.service';

@Component({
  selector: 'app-list-unidades-medida',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-unidades-medida.component.html',
  styleUrls: ['./list-unidades-medida.component.css']
})
export class ListUnidadesMedidaComponent implements OnInit {
  unidades: any[] = [];
  unidadesFiltradas: any[] = [];
  filtro = '';
  mostrarModal = false;

  unidad = { idunidadmedida: 0, nombre: '' };

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private unidadService: UnidadMedidaService) {}

  ngOnInit(): void {
    this.cargarUnidades();
  }

  navegarYMostrarModal(): void {
    this.abrirModal();
  }

  cargarUnidades(): void {
    this.unidadService.listarUnidadesMedida().subscribe({
      next: data => {
        this.unidades = data || [];
        this.aplicarFiltro();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las unidades', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let list = this.unidades;
    if (term) {
      list = list.filter(u =>
        u.nombre.trim().toLowerCase().includes(term) ||
        u.idunidadmedida.toString().includes(term)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.unidadesFiltradas = list.slice(start, start + this.elementosPorPagina);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  get totalPaginas(): number {
  const term = this.filtro.trim().toLowerCase();
  const count = term
    ? this.unidades.filter(u =>
        u.nombre.trim().toLowerCase().includes(term) ||
        u.idunidadmedida.toString().includes(term)
      ).length
    : this.unidades.length;
  return Math.ceil(count / this.elementosPorPagina);
}

get paginasArray(): number[] {
  return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
}


  abrirModal(): void {
    this.unidad = { idunidadmedida: 0, nombre: '' };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    const payload = { nombre: this.unidad.nombre?.trim() };
    // Prevent empty name
    if (!payload.nombre) {
  Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
  return;
}
    const peticion$ = this.unidad.idunidadmedida > 0
      ? this.unidadService.editarUnidadMedida({
          idunidadmedida: this.unidad.idunidadmedida,
          nombre: payload.nombre
        })
      : this.unidadService.registrarUnidadMedida(payload);

    peticion$.subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          this.unidad.idunidadmedida > 0
            ? 'Unidad actualizada'
            : 'Unidad registrada',
          'success'
        );
        this.cerrarModal();
        this.cargarUnidades();
      },
      error: err => {
  console.error('Error en formSubmit:', err);
  // Extraemos bien el cuerpo del error
  const errorBody = err.error && typeof err.error === 'object' ? err.error : {};
  // Prioriza message, luego error, si no, un fallback
  const mensaje = errorBody.message || errorBody.error || 'Error inesperado';
  // Si es conflicto usamos warning, si no error
  const icon: 'warning' | 'error' = err.status === 409 ? 'warning' : 'error';
  // Mostramos alerta con el título correcto
  Swal.fire(
    err.status === 409 ? 'Atención' : 'Error',
    mensaje,
    icon
  );
}

    });
  }

  cargarParaEditar(id: number): void {
    this.unidadService.buscarUnidadPorId(id).subscribe({
      next: data => {
        this.unidad = { idunidadmedida: data.idunidadmedida, nombre: data.nombre };
        this.mostrarModal = true;
      },
      error: err => {
        console.error('Error carga edición:', err);
        Swal.fire('Error', err.error?.message || 'No se pudo cargar unidad', 'error');
      }
    });
  }

  eliminarUnidad(id: number): void {
    Swal.fire({
      title: '¿Eliminar?',
      text: 'No podrás deshacer esto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.unidadService.eliminarUnidadMedida(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Unidad eliminada', 'success');
          this.cargarUnidades();
        },
        error: err => {
          console.error('Error eliminación:', err);
          const mensaje = err.error?.message || 'Error al eliminar';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    });
  }
}
