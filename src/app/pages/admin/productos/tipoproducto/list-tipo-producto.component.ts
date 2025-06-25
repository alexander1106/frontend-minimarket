// src/app/pages/admin/modulo-inventario/tipoproducto/list-tipoproducto.component.ts
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { TipoProductoService } from '../../../../service/tipo-producto.service';

@Component({
  selector: 'app-list-tipo-producto',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
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
    this.tipo = tipo ? { ...tipo } : { idtipoproducto: 0, nombre: '' };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    const payload = { nombre: this.tipo.nombre?.trim() };
    if (!payload.nombre) {
      Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
      return;
    }
    const peticion$ = this.tipo.idtipoproducto > 0
      ? this.service.editar(this.tipo)
      : this.service.registrar(payload);

    peticion$.subscribe({
      next: () => {
        Swal.fire('Éxito', this.tipo.idtipoproducto > 0 ? 'Tipo actualizado' : 'Tipo registrado', 'success');
        this.cerrarModal();
        this.cargarTipos();
      },
      error: err => {
        const body = err.error && typeof err.error === 'object' ? err.error : {};
        const msg = body.message || body.error || 'Error inesperado';
        const icon: 'warning' | 'error' = err.status === 409 ? 'warning' : 'error';
        Swal.fire(err.status === 409 ? 'Atención' : 'Error', msg, icon);
      }
    });
  }

  eliminar(id: number): void {
    Swal.fire({ title: '¿Eliminar?', text: 'No podrás revertir esto', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí' })
      .then(r => {
        if (!r.isConfirmed) return;
        this.service.eliminar(id).subscribe({
          next: () => { Swal.fire('Eliminado', 'Tipo eliminado', 'success'); this.cargarTipos(); },
          error: err => Swal.fire('Error', err.error?.message || 'Error al eliminar', 'error')
        });
      });
  }
}