import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { UnidadMedidaService } from '../../../../service/unidad-medida.service';
import { LoginService } from '../../../../service/login.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';

@Component({
  selector: 'app-list-unidades-medida',
  standalone: true,
  imports: [PaginacionComponent, 
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
  cargando = true;
  mostrarModal = false;

  unidad: { idunidadmedida: number; nombre: string; codigo: string; permiteDecimales: boolean } =
    { idunidadmedida: 0, nombre: '', codigo: '', permiteDecimales: false };
  errores: Record<string, string> = {};
  avisoModal = '';

  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  puedeEscribir = false;

  constructor(
    private unidadService: UnidadMedidaService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.puedeEscribir = this.loginService.hasRole('SUPERADMIN');
    this.cargarUnidades();
  }

  navegarYMostrarModal(): void {
    if (!this.puedeEscribir) return;
    this.abrirModal();
  }

  cargarUnidades(): void {
    this.unidadService.listarUnidadesMedida().subscribe({
      next: data => {
        this.cargando = false;
        this.unidades = data || [];
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
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
        (u.codigo || '').toLowerCase().includes(term) ||
        u.idunidadmedida.toString().includes(term)
      );
    }
    this.totalFiltrado = list.length;
    if (this.paginaActual > 1 && (this.paginaActual - 1) * this.elementosPorPagina >= list.length) this.paginaActual = 1;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.unidadesFiltradas = list.slice(start, start + this.elementosPorPagina);
  }

  cambiarFilas(n: number): void {
    this.elementosPorPagina = n;
    this.paginaActual = 1;
    this.aplicarFiltro();
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalFiltrado / this.elementosPorPagina));
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  abrirModal(): void {
    this.unidad = { idunidadmedida: 0, nombre: '', codigo: '', permiteDecimales: false };
    this.errores = {};
    this.avisoModal = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    this.errores = {};
    this.avisoModal = '';
    const nombre = this.unidad.nombre?.trim();
    if (!nombre) {
      this.errores['nombre'] = 'El nombre no puede estar vacío.';
      return;
    }
    const codigo = (this.unidad.codigo || '').trim().toUpperCase();
    const payload = { nombre, codigo: codigo || null, permiteDecimales: !!this.unidad.permiteDecimales };
    const edita = this.unidad.idunidadmedida > 0;

    const peticion$: Observable<any> = edita
      ? this.unidadService.editarUnidadMedida({ idunidadmedida: this.unidad.idunidadmedida, ...payload })
      : this.unidadService.registrarUnidadMedida(payload);

    peticion$.subscribe({
      next: () => {
        Swal.fire('Éxito', edita ? 'Unidad actualizada' : 'Unidad registrada', 'success');
        this.cerrarModal();
        this.cargarUnidades();
      },
      error: (err: any) => {
        console.error('Error en formSubmit:', err);
        const campos = err.error?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
          this.avisoModal = err.error?.message || '';
          return;
        }
        Swal.fire({
          icon: err.status === 409 || err.status === 400 ? 'warning' : 'error',
          title: err.status === 409 ? 'Atención' : err.status === 400 ? 'No permitido' : 'Error',
          text: err.error?.message ?? 'Error inesperado',
          confirmButtonText: 'OK'
        });
      }
    });
  }

cargarParaEditar(id: number): void {
  this.unidadService.buscarUnidadPorId(id).subscribe({
    next: data => {
      if (!data) {
        Swal.fire({
          icon: 'warning',
          title: 'No encontrado',
          text: 'La unidad solicitada no existe',
          confirmButtonText: 'OK'
        });
        return;
      }
      this.unidad = {
        idunidadmedida: data.idunidadmedida,
        nombre: data.nombre,
        codigo: data.codigo || '',
        permiteDecimales: !!data.permiteDecimales
      };
      this.errores = {};
      this.avisoModal = '';
      this.mostrarModal = true;
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error carga edición:', err);
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
    if (!this.puedeEscribir) return;
    Swal.fire({
      title: '¿Eliminar?',
      text: 'No podrás deshacer esto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.unidadService.eliminarUnidadMedida(id).subscribe({
        next: (resp: any) => {
          Swal.fire('Eliminado', resp?.message || 'Unidad eliminada', 'success');
          this.cargarUnidades();
        },
        error: (err: any) => {
          console.error('Error eliminación:', err);
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
