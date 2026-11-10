import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { AlmacenesService } from '../../../../service/almacenes.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';

interface Almacen {
  idalmacen: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  encargado: string;
  estado: number;
  idsucursal: number;
  sucursalNombre?: string;
  fechaRegistro?: string;
}

interface Sucursal {
  idsucursal: number;
  nombre: string;
}

@Component({
  selector: 'app-list-almacenes',
  standalone: true,
  imports: [PaginacionComponent, 
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
  sucursalFiltro: number = 0;

  fechaInicio: string = '';
  fechaFin: string = '';

  mostrarModal = false;
  cargando = true;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};

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
  totalFiltrado = 0;

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
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar sucursales', 'error');
      }
    });
  }

  private cargarAlmacenes(): void {
    this.cargando = true;
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
            sucursalNombre: this.sucursales.find(s => s.idsucursal === sid)?.nombre ?? '—',
            fechaRegistro: a.fechaRegistro ?? a.fechaCreacion ?? ''
          } as Almacen;
        });
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar almacenes', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    let list = this.almacenes;

    const t = this.filtro.trim().toLowerCase();
    if (t) {
      list = list.filter(a =>
        a.nombre.toLowerCase().includes(t) ||
        a.descripcion.toLowerCase().includes(t) ||
        (a.sucursalNombre ?? '').toLowerCase().includes(t)
      );
    }

    if (this.sucursalFiltro !== 0) {
      list = list.filter(a => a.idsucursal === this.sucursalFiltro);
    }

    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      list = list.filter(a => {
        const fecha = new Date(a.fechaRegistro || '');
        return fecha >= inicio && fecha <= fin;
      });
    }

    this.totalFiltrado = list.length;
    if (this.paginaActual > 1 && (this.paginaActual - 1) * this.elementosPorPagina >= list.length) this.paginaActual = 1;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = list.slice(start, start + this.elementosPorPagina);
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
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  get sucursalesConAlmacen(): number {
    return new Set(this.almacenes.map(a => a.idsucursal)).size;
  }

  abrirModal(a?: Almacen): void {
    this.errores = {};
    this.aviso = '';
    this.almacen = a ? { ...a } : {
      idalmacen: 0, nombre: '', descripcion: '', direccion: '',
      encargado: '', estado: 1, idsucursal: 0
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; }

  formSubmit(): void {
    this.errores = {};
    this.aviso = '';
    if (!this.almacen.nombre.trim()) this.errores['nombre'] = 'El nombre es obligatorio.';
    if (!this.almacen.idsucursal || Number(this.almacen.idsucursal) === 0) this.errores['idsucursal'] = 'Elige una sucursal.';
    if (Object.keys(this.errores).length) return;

    const payload = {
      idalmacen: this.almacen.idalmacen,
      nombre: this.almacen.nombre.trim(),
      descripcion: this.almacen.descripcion,
      direccion: this.almacen.direccion,
      encargado: this.almacen.encargado,
      estado: this.almacen.estado,
      idSucursal: Number(this.almacen.idsucursal)
    };

    const edita = this.almacen.idalmacen > 0;
    this.guardando = true;
    const pet$ = edita ? this.svc.editar(payload) : this.svc.registrar(payload);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', edita ? 'Almacén actualizado' : 'Almacén registrado', 'success');
        this.cerrarModal();
        this.cargarAlmacenes();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'Error inesperado';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') this.errores = { ...campos };
        else this.aviso = msg;
      }
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
