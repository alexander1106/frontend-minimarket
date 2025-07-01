import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent }       from '../../../../components/header/header.component';
import { SucursalesService }    from '../../../../service/sucursales.service';
import { EmpresasService }      from '../../../../service/empresas.service';


// --- Interfaces inline, no ficheros adicionales ---
interface Empresa {
  idempresa?: number;
  razonsocial: string;
  // añade aquí otros campos si los necesitas
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
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-sucursales.component.html',
  styleUrls: ['./list-sucursales.component.css']
})
export class ListSucursalesComponent implements OnInit {
  // Datos
  sucursales: Sucursal[] = [];
  filtrados:   Sucursal[] = [];
  empresas:    Empresa[]  = [];

  // Estado del componente
  filtro = '';
  mostrarModal = false;

  // Objeto actual para el formulario
  sucursal: Sucursal = {
    nombreSucursal: '',
    contacto: '',
    direccion: '',
    estado: 1,
    idEmpresa: 0
  };

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private svc: SucursalesService,
    private empSvc: EmpresasService
  ) {}

  ngOnInit(): void {
    // Cargar primero las empresas para el dropdown
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
    error: () => Swal.fire('Error', 'No se pudieron cargar sucursales', 'error')
  });
}


  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    let list = this.sucursales;
    if (t) {
      list = list.filter(s =>
        s.nombreSucursal.toLowerCase().includes(t) ||
        s.direccion.toLowerCase().includes(t) ||
        (s.empresaNombre ?? '').toLowerCase().includes(t)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.sucursales.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(s?: Sucursal): void {
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
    // Validaciones básicas
    if (!this.sucursal.nombreSucursal.trim()) {
      Swal.fire('Atención', 'El nombre de la sucursal es obligatorio', 'warning');
      return;
    }
    if (!this.sucursal.idEmpresa || this.sucursal.idEmpresa === 0) {
      Swal.fire('Atención', 'Debes seleccionar una empresa', 'warning');
      return;
    }

    // Construir DTO para el backend
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
      : this.svc.registrarSucural(dto);

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
