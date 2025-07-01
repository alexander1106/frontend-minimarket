// Importaciones
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { UsuariosService } from '../../../../service/usuarios.service';
import { RolesService } from '../../../../service/roles.service';
import { EmpresasService } from '../../../../service/empresas.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { Observable, forkJoin } from 'rxjs';

// Interfaces
interface Usuario {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  username: string;
  email: string;
  dni: string;
  turno: string;
  estado: boolean;
  idEmpresa: number | null;
  rolId: number | null;
  idSucursal: number | null;
  empresaNombre?: string;
  rolNombre?: string;
  password?: string;
}

interface Empresa {
  idempresa: number;
  razonsocial: string;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Sucursal {
  id_sucursal: number;
  nombreSucursal: string;
  idempresa: number;
}

// Componente
@Component({
  selector: 'app-list-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.css']
})
export class ListUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filtrados: Usuario[] = [];
  empresas: Empresa[] = [];
  roles: Rol[] = [];
  sucursalesRaw: Sucursal[] = [];
  sucursalesFiltradas: Sucursal[] = [];

  filtro = '';
  mostrarModal = false;

  usuario: Usuario = {
    idUsuario: 0,
    nombre: '',
    apellidos: '',
    username: '',
    email: '',
    dni: '',
    turno: '',
    estado: true,
    idEmpresa: null,
    rolId: null,
    idSucursal: null
  };

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private svc: UsuariosService,
    private rolSvc: RolesService,
    private empSvc: EmpresasService,
    private sucSvc: SucursalesService
  ) {}

  ngOnInit(): void {
    forkJoin({
      emp: this.empSvc.listarEmpresas(),
      rol: this.rolSvc.listarRoles(),
      suc: this.sucSvc.listarSucursales()
    }).subscribe(
      ({ emp, rol, suc }) => {
        this.empresas = emp;
        this.roles = rol;
        this.sucursalesRaw = suc.map((s: any) => ({
          id_sucursal: s.id_sucursal,
          nombreSucursal: s.nombreSucursal,
          idempresa: s.idempresa || s.empresa?.idempresa
        }));
        this.sucursalesFiltradas = [];
        this.cargarUsuarios();
      },
      () => Swal.fire('Error', 'No se pudieron cargar datos', 'error')
    );
  }

  onEmpresaChange(idEmpresa: number): void {
    this.usuario.idSucursal = null;
    this.sucursalesFiltradas = this.sucursalesRaw.filter(s => s.idempresa === idEmpresa);
    console.log('Sucursales filtradas:', this.sucursalesFiltradas);
  }

  private cargarUsuarios(): void {
    this.svc.listarUsuarios().subscribe({
      next: data => {
        this.usuarios = data.map((u: any) => {
          return {
            ...u,
            idEmpresa: u.idEmpresa,
            rolId: u.rolId,
            idSucursal: u.idSucursal,
            empresaNombre: u.empresaNombre,
            rolNombre: u.rolNombre
          };
        });
        this.aplicarFiltro();
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar usuarios', 'error')
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    const lista = t
      ? this.usuarios.filter(u =>
          u.nombre.toLowerCase().includes(t) ||
          u.username.toLowerCase().includes(t) ||
          u.email.toLowerCase().includes(t))
      : this.usuarios;

    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = lista.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    const count = this.filtro
      ? this.usuarios.filter(u => u.nombre.toLowerCase().includes(this.filtro.trim().toLowerCase())).length
      : this.usuarios.length;
    return Math.ceil(count / this.elementosPorPagina);
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

  abrirModal(u?: Usuario): void {
    if (u) {
      this.usuario = { ...u };
      this.onEmpresaChange(this.usuario.idEmpresa!);
    } else {
      this.usuario = {
        idUsuario: 0,
        nombre: '',
        apellidos: '',
        username: '',
        email: '',
        dni: '',
        turno: '',
        estado: true,
        idEmpresa: null,
        rolId: null,
        idSucursal: null
      };
      this.sucursalesFiltradas = [];
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    const u = this.usuario;
    if (!u.nombre || !u.username || !u.idEmpresa || !u.rolId || !u.idSucursal) {
      Swal.fire('Atención', 'Completa todos los campos obligatorios', 'warning');
      return;
    }

    const dto = {
      ...u,
      estado: u.estado ? 1 : 0
    };

    const pet$: Observable<any> = u.idUsuario > 0 ? this.svc.editar(dto) : this.svc.registrar(dto);

    pet$.subscribe({
      next: () => {
        Swal.fire('Éxito', u.idUsuario > 0 ? 'Usuario actualizado' : 'Usuario registrado', 'success');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: err => Swal.fire('Error', err.error?.message || 'Error inesperado', 'error')
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next: () => { Swal.fire('Eliminado', 'Usuario eliminado', 'success'); this.cargarUsuarios(); },
        error: err => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error')
      });
    });
  }
}
