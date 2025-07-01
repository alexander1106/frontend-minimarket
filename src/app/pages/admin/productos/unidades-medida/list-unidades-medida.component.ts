import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';               // ← Añadido
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { UnidadMedidaService } from '../../../../service/unidad-medida.service';

@Component({
  selector: 'app-list-unidades-medida',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    BarraLateralComponent,
    HeaderComponent
  ],
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
  if (!payload.nombre) {
    Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
    return;
  }

  const peticion$: Observable<any> =
    this.unidad.idunidadmedida > 0
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
    error: (err: any) => {
      console.error('Error en formSubmit:', err);

      // Mensaje que venga del backend
      const mensajeBackend = err.error?.message;
      // Si no hay mensaje del backend, fallback genérico
      const texto = mensajeBackend ?? 'Error inesperado';

      Swal.fire({
        icon: err.status === 409 || err.status === 400 ? 'warning' : 'error',
        title: err.status === 409
          ? 'Atención'
          : err.status === 400
            ? 'No permitido'
            : 'Error',
        text: texto,
        confirmButtonText: 'OK'
      });
    }
  });
}

cargarParaEditar(id: number): void {
  this.unidadService.buscarUnidadPorId(id).subscribe({
    next: data => {
      // 1) Si el backend devuelve null o undefined
      if (!data) {
        Swal.fire({
          icon: 'warning',
          title: 'No encontrado',
          text: 'La unidad solicitada no existe',
          confirmButtonText: 'OK'
        });
        return;
      }
      // 2) Si todo OK, cargamos y abrimos el modal
      this.unidad = {
        idunidadmedida: data.idunidadmedida,
        nombre: data.nombre
      };
      this.mostrarModal = true;
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error carga edición:', err);
      // 3) Mensaje y título según el status
      let title = 'Error';
      let text = 'Error inesperado';
      let icon: 'warning' | 'error' = 'error';

      if (err.status === 404) {
        title = 'No encontrado';
        text = err.error?.message ?? 'No se encontró la unidad';
        icon = 'warning';
      } else if (err.status === 0) {
        title = 'Sin conexión';
        text = 'No se pudo conectar con el servidor';
      } else {
        // Para otros códigos (500, etc)
        text = err.error?.message ?? text;
      }

      Swal.fire({
        icon,
        title,
        text,
        confirmButtonText: 'OK'
      });
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
        error: (err: any) => {
          console.error('Error eliminación:', err);
          // Toma exactamente el message del backend
          const mensaje = err.error?.message ?? 'No se puede eliminar, esta asociado a un producto';
          Swal.fire({
            icon: 'error',
            title: err.status === 400 ? 'Atención' : 'Error',
            text: mensaje,
            confirmButtonText: 'OK'
          });
        }
      });
    });
  }
}
