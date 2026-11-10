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
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';

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
  imports: [PaginacionComponent, 
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
  almacenFiltro = 0;
  mostrarModal = false;
  cargando = true;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};

  inventario: Inventario = this.resetInventario();
  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  constructor(
    private invSvc: InventarioService,
    private almSvc: AlmacenesService
  ) {}

  ngOnInit(): void {
    this.cargando = true;
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
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
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

    this.totalFiltrado = lista.length;
    if (this.paginaActual > 1 && (this.paginaActual - 1) * this.elementosPorPagina >= lista.length) this.paginaActual = 1;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = lista.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalFiltrado / this.elementosPorPagina));
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarFilas(n: number): void {
    this.elementosPorPagina = n;
    this.paginaActual = 1;
    this.aplicarFiltro();
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  get almacenesSinInventario(): number {
    const conInventario = new Set(this.inventarios.map(i => i.idalmacen));
    return this.almacenes.filter(a => !conInventario.has(a.idalmacen)).length;
  }

  abrirModal(inv?: InventarioConAlmacen): void {
    this.errores = {};
    this.aviso = '';
    this.inventario = inv
      ? { idinventario: inv.idinventario, nombre: inv.nombre, descripcion: inv.descripcion, idalmacen: inv.idalmacen }
      : this.resetInventario();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    this.errores = {};
    this.aviso = '';
    if (!this.inventario.nombre.trim()) this.errores['nombre'] = 'El nombre es obligatorio.';
    if (!this.inventario.idalmacen) this.errores['idalmacen'] = 'Selecciona un almacén.';
    if (Object.keys(this.errores).length) return;

    const isEdit = this.inventario.idinventario > 0;
    this.guardando = true;
    const pet$ = isEdit ? this.invSvc.editar(this.inventario) : this.invSvc.registrar(this.inventario);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', isEdit ? 'Inventario actualizado' : 'Inventario registrado', 'success');
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.Detalle) || 'Error inesperado';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') this.errores = { ...campos };
        else this.aviso = msg;
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
