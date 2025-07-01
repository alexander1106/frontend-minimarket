import { Component, OnInit } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { TipoProductoService } from '../../../../service/tipo-producto.service';

@Component({
  selector: 'app-list-tipo-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-tipo-producto.component.html',
  styleUrls: ['./list-tipo-producto.component.css']
})
export class ListTipoProductoComponent implements OnInit {
  tipos: any[] = [];
  tiposFiltrados: any[] = [];
  filtro = '';
  mostrarModal = false;
  tipo = { idtipoproducto: 0, nombre: '' };
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private service: TipoProductoService) {}

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.service.listarTipos().subscribe({
      next: data => {
        this.tipos = data || [];
        this.aplicarFiltro();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar tipos', 'error')
    });
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let list = this.tipos;
    if (term) {
      list = list.filter(t =>
        t.nombre.trim().toLowerCase().includes(term) ||
        t.idtipoproducto.toString().includes(term)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.tiposFiltrados = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(
      this.tipos.filter(t =>
        !this.filtro || t.nombre.trim().toLowerCase().includes(this.filtro.trim().toLowerCase())
      ).length / this.elementosPorPagina
    );
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  abrirModal(tipo?: any): void {
    this.tipo = tipo ? { idtipoproducto: tipo.idtipoproducto, nombre: tipo.nombre } : { idtipoproducto: 0, nombre: '' };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
  const nombre = this.tipo.nombre.trim();
  const isEdit = this.tipo.idtipoproducto > 0;

  if (!nombre) {
    Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
    return;
  }

  const payload = isEdit
    ? { idtipoproducto: this.tipo.idtipoproducto, nombre }
    : { nombre };

  const peticion$: Observable<any> = isEdit
    ? this.service.editar(payload)
    : this.service.registrar(payload);

  peticion$.subscribe({
    next: () => {
      Swal.fire(
        'Éxito',
        isEdit ? 'Tipo actualizado' : 'Tipo registrado',
        'success'
      );
      this.cerrarModal();
      this.cargarTipos();
    },
    error: (err: any) => {
      console.error('Error en formSubmit TipoProducto:', err);
      const status = err.status;
      const body = err.error;
      const msg = typeof body === 'string' ? body : body?.message;

      // 1) Edición de tipo en uso
      if (isEdit && msg?.toLowerCase().includes('usado')) {
        Swal.fire(
          'Atención',
          'No se puede editar: este tipo está siendo usado en productos',
          'warning'
        );
        return;
      }

      if (status === 409 || msg?.toLowerCase().includes('ya existe')) {
        Swal.fire(
          'Atención',
          msg ?? 'Ya existe un registro con ese nombre',
          'warning'
        );
        return;
      }

      Swal.fire(
        'Error',
        msg ?? 'Error inesperado',
        'error'
      );
    }
  });
}


  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.service.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Tipo eliminado', 'success');
          this.cargarTipos();
        },
        error: (err: any) => {
          console.error('Error eliminación TipoProducto:', err);
          const msg = err.error?.message ?? 'Está asociado a productos';
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: msg,
            confirmButtonText: 'OK'
          });
        }
      });
    });
  }
}
