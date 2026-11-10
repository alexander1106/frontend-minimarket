import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent }       from '../../../../components/header/header.component';
import { SucursalesService }    from '../../../../service/sucursales.service';
import { EmpresasService }      from '../../../../service/empresas.service';
import { Router } from '@angular/router';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';

interface Empresa {
  idempresa?: number;
  razonsocial: string;
}

interface Sucursal {
  idSucursal?: number;
  nombreSucursal: string;
  contacto: string;
  direccion: string;
  estado: number;
  idEmpresa: number;
  empresaNombre?: string;
}

@Component({
  selector: 'app-list-sucursales',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent,
  ],
  templateUrl: './list-sucursales.component.html',
  styleUrls: ['./list-sucursales.component.css']
})
export class ListSucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  filtrados:   Sucursal[] = [];
  empresas:    Empresa[]  = [];

  filtro = '';
  pagina = 1;
  porPagina = 5;

  filtroEmpresa = '';
  cargando = true;
  errores: Record<string, string> = {};
  mostrarModal = false;

  sucursal: Sucursal = {
    nombreSucursal: '',
    contacto: '',
    direccion: '',
    estado: 1,
    idEmpresa: 0
  };

  constructor(
    private svc: SucursalesService,
    private empSvc: EmpresasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.empSvc.listarEmpresas().subscribe({
      next: (emp: Empresa[]) => {
        this.empresas = emp;
        this.cargarSucursales();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar empresas', 'error')
    });
  }

  private cargarSucursales(): void {
  this.svc.listarSucursales().subscribe({
    next: (data: any[]) => {
      this.cargando = false;
      this.sucursales = data.map(s => ({
        idSucursal:     s.idSucursal,
        nombreSucursal: s.nombreSucursal,
        contacto:       s.contacto,
        direccion:      s.direccion,
        estado:         s.estado,
        idEmpresa:      s.id_empresa,
        empresaNombre:  s.empresaNombre
      }));
      this.aplicarFiltro();
    },
    error: () => { this.cargando = false; Swal.fire('Error', 'No se pudieron cargar sucursales', 'error'); }
  });
}

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = this.sucursales.filter(s =>
      (!this.filtroEmpresa || String(s.idEmpresa) === this.filtroEmpresa) &&
      (!t ||
        (s.nombreSucursal || '').toLowerCase().includes(t) ||
        (s.direccion || '').toLowerCase().includes(t) ||
        (s.empresaNombre ?? '').toLowerCase().includes(t))
    );
  }

  get empresasConSucursal(): number {
    return new Set(this.sucursales.map(s => s.idEmpresa)).size;
  }

  get activas(): number {
    return this.sucursales.filter(s => s.estado === 1).length;
  }

  iniciales(nombre: string): string {
    return (nombre || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  abrirModal(s?: Sucursal): void {
    this.errores = {};
    if (s) {
      this.sucursal = { ...s };
    } else {
      this.sucursal = {
        nombreSucursal: '',
        contacto: '',
        direccion: '',
        estado: 1,
        idEmpresa: 0
      };
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    this.errores = {};
    if (!this.sucursal.nombreSucursal.trim()) this.errores['nombreSucursal'] = 'El nombre de la sucursal es obligatorio.';
    if (!this.sucursal.idEmpresa) this.errores['idEmpresa'] = 'Debes seleccionar una empresa.';
    if (Object.keys(this.errores).length) return;

    const dto: any = {
      idSucursal:    this.sucursal.idSucursal,
      nombreSucursal: this.sucursal.nombreSucursal,
      contacto:       this.sucursal.contacto,
      direccion:      this.sucursal.direccion,
      estado:         this.sucursal.estado,
      id_empresa:     this.sucursal.idEmpresa
    };

    const pet$ = dto.idSucursal
      ? this.svc.editar(dto)
      : this.svc.registrar(dto);

    pet$.subscribe({
      next: () => {
        Swal.fire('Éxito', dto.idSucursal ? 'Actualizado' : 'Registrado', 'success');
        this.cerrarModal();
        this.cargarSucursales();
      },
      error: err => {
        Swal.fire(
          err.status === 400 ? 'Atención' : 'Error',
          err.error?.message || 'Error inesperado',
          err.status === 400 ? 'warning' : 'error'
        );
      }
    });
  }
usuarios(id: any) {
  console.log('id:', id);
  if (!id) {
    console.error('Sucursal no tiene id:', id);
    alert('Sucursal sin ID, no se puede navegar');
    return;
  }

  this.router.navigate(['/admin/usuarios', id]);
}

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar sucursal?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminada', 'Sucursal eliminada', 'success');
          this.cargarSucursales();
        },
        error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
      });
    });
  }
}
