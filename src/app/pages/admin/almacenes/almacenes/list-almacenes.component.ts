import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { AlmacenesService } from '../../../../service/almacenes.service';
import { SucursalesService } from '../../../../service/sucursales.service';

interface Almacen {
  idalmacen: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  encargado: string;
  estado: number;
  idsucursal: number;
  sucursalNombre?: string;
}

interface Sucursal {
  idsucursal: number;
  nombre: string;
}

@Component({
  selector: 'app-list-almacenes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-almacenes.component.html',
  styleUrls: ['./list-almacenes.component.css']
})
export class ListAlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  filtrados: Almacen[] = [];
  sucursales: Sucursal[] = [];

  filtro = '';
  sucursalFiltro: number = 0;      // ← NUEVO filtro por sucursal

  mostrarModal = false;

  almacen: Almacen = {
    idalmacen: 0,
    nombre: '',
    descripcion: '',
    direccion: '',
    encargado: '',
    estado: 1,
    idsucursal: 0
  };

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private svc: AlmacenesService,
    private sucSvc: SucursalesService
  ) {}

  ngOnInit(): void {
    this.loadSucursales();
  }

  private loadSucursales(): void {
    this.sucSvc.listarSucursales().subscribe({
      next: raw => {
        this.sucursales = raw.map((s: any) => ({
          idsucursal: Number(s.idsucursal ?? s.id_sucursal ?? s.idSucursal),
          nombre: s.nombre ?? s.nombreSucursal
        }));
        this.cargarAlmacenes();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar sucursales', 'error')
    });
  }

  private cargarAlmacenes(): void {
    this.svc.listarAlmacenes().subscribe({
      next: data => {
        this.almacenes = data.map((a: any) => {
          const sid = Number(a.idsucursal ?? a.idSucursal ?? a.id_sucursal ?? 0);
          return {
            idalmacen: a.idalmacen,
            nombre: a.nombre,
            descripcion: a.descripcion,
            direccion: a.direccion,
            encargado: a.encargado,
            estado: a.estado,
            idsucursal: sid,
            sucursalNombre: this.sucursales.find(s => s.idsucursal === sid)?.nombre ?? '—'
          } as Almacen;
        });
        this.aplicarFiltro();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar almacenes', 'error')
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    let list = this.almacenes;

    // Filtro por texto
    if (t) {
      list = list.filter(a =>
        a.nombre.toLowerCase().includes(t) ||
        a.descripcion.toLowerCase().includes(t) ||
        (a.sucursalNombre ?? '').toLowerCase().includes(t)
      );
    }

    // Filtro por sucursal seleccionada
    if (this.sucursalFiltro !== 0) {
      list = list.filter(a => a.idsucursal === this.sucursalFiltro);
    }

    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.almacenes.length / this.elementosPorPagina);
  }
  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(a?: Almacen): void {
    this.almacen = a ? { ...a } : {
      idalmacen: 0, nombre: '', descripcion: '', direccion: '',
      encargado: '', estado: 1, idsucursal: 0
    };
    this.mostrarModal = true;
  }
  cerrarModal(): void { this.mostrarModal = false; }

  formSubmit(): void {
    if (!this.almacen.nombre.trim()) {
      Swal.fire('Atención', 'El nombre es obligatorio', 'warning'); return;
    }
    if (!this.almacen.idsucursal || Number(this.almacen.idsucursal) === 0) {
      Swal.fire('Atención', 'Debes elegir una sucursal', 'warning'); return;
    }

    const payload = {
      idalmacen: this.almacen.idalmacen,
      nombre: this.almacen.nombre,
      descripcion: this.almacen.descripcion,
      direccion: this.almacen.direccion,
      encargado: this.almacen.encargado,
      estado: this.almacen.estado,
      idSucursal: Number(this.almacen.idsucursal)
    };

    const pet$ = this.almacen.idalmacen > 0 ? this.svc.editar(payload)
                                            : this.svc.registrar(payload);

    pet$.subscribe({
      next : () => { Swal.fire('Éxito', this.almacen.idalmacen > 0 ? 'Actualizado' : 'Registrado', 'success');
                     this.cerrarModal(); this.cargarAlmacenes(); },
      error: err => Swal.fire(err.status === 400 ? 'Atención' : 'Error',
                              err.error?.message || 'Error inesperado',
                              err.status === 400 ? 'warning' : 'error')
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar almacén?', text: 'No podrás deshacer esto',
      icon : 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next : () => { Swal.fire('Eliminado', 'Almacén eliminado', 'success'); this.cargarAlmacenes(); },
        error: err => Swal.fire('Atención', err.error?.message ?? 'Error', 'warning')
      });
    });
  }
}
