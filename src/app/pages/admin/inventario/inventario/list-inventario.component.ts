// ... tus imports originales ...
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { InventarioService } from '../../../../service/inventario.service';
import { AlmacenesService } from '../../../../service/almacenes.service';

// Interfaces
interface Inventario {
  idinventario: number;
  nombre: string;
  descripcion: string;
  idalmacen: number;
}

interface Almacen {
  idalmacen: number;
  nombre: string;
}

interface InventarioConAlmacen extends Inventario {
  almacen: Almacen | null;
}

@Component({
  selector: 'app-list-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-inventario.component.html',
  styleUrls: ['./list-inventario.component.css']
})
export class ListInventarioComponent implements OnInit {
  inventarios: InventarioConAlmacen[] = [];
  filtrados: InventarioConAlmacen[] = [];
  almacenes: Almacen[] = [];
  filtro = '';
  almacenFiltro = 0; // 🔽 NUEVO: para seleccionar el almacén desde el combobox
  mostrarModal = false;

  inventario: Inventario = this.resetInventario();
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private invSvc: InventarioService,
    private almSvc: AlmacenesService
  ) {}

  ngOnInit(): void {
    forkJoin({
      invs: this.invSvc.listarInventario(),
      alms: this.almSvc.listarAlmacenes()
    }).subscribe({
      next: ({ invs, alms }: { invs: Inventario[]; alms: Almacen[] }) => {
        this.almacenes = alms;
        this.inventarios = invs.map((inv: Inventario) => ({
          ...inv,
          almacen: alms.find((a: Almacen) => a.idalmacen === inv.idalmacen) || null
        }));
        this.aplicarFiltro();
      },
      error: err => {
        console.error('Error cargando datos:', err);
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    });
  }

  resetInventario(): Inventario {
    return {
      idinventario: 0,
      nombre: '',
      descripcion: '',
      idalmacen: 0
    };
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let lista = [...this.inventarios];

    if (this.almacenFiltro) {
      lista = lista.filter(i => i.idalmacen === this.almacenFiltro);
    }

    if (term) {
      lista = lista.filter(i =>
        i.nombre.trim().toLowerCase().includes(term) ||
        i.descripcion.trim().toLowerCase().includes(term) ||
        (i.almacen?.nombre || '').toLowerCase().includes(term)
      );
    }

    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = lista.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(inv?: InventarioConAlmacen): void {
    this.inventario = inv
      ? { idinventario: inv.idinventario, nombre: inv.nombre, descripcion: inv.descripcion, idalmacen: inv.idalmacen }
      : this.resetInventario();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    if (!this.inventario.nombre.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
      return;
    }
    if (!this.inventario.idalmacen) {
      Swal.fire('Atención', 'Debe seleccionar un almacén', 'warning');
      return;
    }

    const isEdit = this.inventario.idinventario > 0;
    const pet$ = isEdit
      ? this.invSvc.editar(this.inventario)
      : this.invSvc.registrar(this.inventario);

    pet$.subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          isEdit ? 'Inventario actualizado' : 'Inventario registrado',
          'success'
        );
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        const backendMsg = err.error?.message ?? err.error ?? 'Error inesperado';
        const title = isEdit
          ? 'No se puede editar: tiene registros asociados'
          : 'Ya existe un inventario para el almacén seleccionado';
        Swal.fire(title, backendMsg, 'warning');
      }
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar inventario?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.invSvc.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Inventario eliminado', 'success');
          this.ngOnInit();
        },
        error: (err: any) => {
          const msg = err.error?.message ?? 'Ya tiene registros, no se puede eliminar';
          Swal.fire('Atención', msg, 'warning');
        }
      });
    });
  }
}
