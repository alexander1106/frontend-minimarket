// src/app/pages/admin/modulo-inventario/categorias/list-categorias.component.ts
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { CategoriasService } from '../../../../service/categorias.service';

@Component({
  selector: 'app-list-categorias',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-categorias.component.html',
  styleUrls: ['./list-categorias.component.css']
})
export class ListCategoriasComponent implements OnInit {
  categorias: any[] = [];
  filtradas: any[] = [];
  filtro = '';
  mostrarModal = false;
  cat = { idcategoria: 0, nombre: '', imagen: '' };
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private svc: CategoriasService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.svc.listarCategorias().subscribe({
      next: data => { this.categorias = data; this.aplicarFiltro(); },
      error: () => Swal.fire('Error', 'No se pudieron cargar categorías', 'error')
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    let list = this.categorias;
    if (t) {
      list = list.filter(c =>
        c.nombre.toLowerCase().includes(t) ||
        c.idcategoria.toString().includes(t)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtradas = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    const count = this.filtro
      ? this.categorias.filter(c =>
          c.nombre.toLowerCase().includes(this.filtro.trim().toLowerCase())
        ).length
      : this.categorias.length;
    return Math.ceil(count / this.elementosPorPagina);
    
  }get paginasArray(): number[] {
  return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
}

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  abrirModal(cat?: any): void {
    this.cat = cat ? { ...cat } : { idcategoria: 0, nombre: '', imagen: '' };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    const payload = { nombre: this.cat.nombre.trim(), imagen: this.cat.imagen.trim() };
    if (!payload.nombre) {
      Swal.fire('Atención', 'El nombre no puede estar vacío', 'warning');
      return;
    }
    const pet$ = this.cat.idcategoria
      ? this.svc.editar({ idcategoria: this.cat.idcategoria, ...payload })
      : this.svc.registrar(payload);

    pet$.subscribe({
      next: () => {
        Swal.fire('Éxito', this.cat.idcategoria ? 'Categoría actualizada' : 'Categoría registrada', 'success');
        this.cerrarModal();
        this.cargar();
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
    Swal.fire({
      title: '¿Eliminar?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next: () => { Swal.fire('Eliminado', 'Categoría eliminada', 'success'); this.cargar(); },
        error: err => Swal.fire('Error', err.error?.message || 'Error al eliminar', 'error')
      });
    });
  }
}
