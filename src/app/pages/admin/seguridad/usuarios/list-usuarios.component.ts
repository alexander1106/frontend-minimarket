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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BarraLateralComponent],
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.css']
})
export class ListUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  filtrados: any[] = [];
  empresas: any[] = [];
  roles: any[] = [];

  filtro = '';
  mostrarModal = false;

  idSucursalActual: number | null = null;

  usuario: any = this.crearUsuarioVacio();

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private svc: UsuariosService,
    private rolSvc: RolesService,
    private empSvc: EmpresasService,
    private sucSvc: SucursalesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sucursalIdParam = this.route.snapshot.paramMap.get('id');
    const sucursalId = sucursalIdParam ? Number(sucursalIdParam) : null;
    this.idSucursalActual = sucursalId;

    forkJoin({
      emp: this.empSvc.listarEmpresas(),
      rol: this.rolSvc.listarRoles()
    }).subscribe(
      (res: any) => {
        const { emp, rol } = res;
        this.empresas = emp;
        this.roles = rol;

        this.cargarUsuarios();
      },
      () => Swal.fire('Error', 'No se pudieron cargar datos', 'error')
    );
  }

  private cargarUsuarios(): void {
    if (!this.idSucursalActual) {
      this.usuarios = [];
      this.filtrados = [];
      return;
    }

    this.sucSvc.listarUsuariosPorSUcursales(this.idSucursalActual).subscribe({
      next: data => {
        this.usuarios = data.map((u: any) => ({
          ...u,
          idEmpresa: u.idEmpresa,
          rolId: u.rolId,
          idSucursal: u.idSucursal,
          empresaNombre: u.empresaNombre,
          rolNombre: u.rolNombre
        }));
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

  abrirModal(u?: any): void {
    if (u) {
      // Editar usuario
      this.usuario = { ...u };
    } else {
      // Nuevo usuario
      this.usuario = this.crearUsuarioVacio();
    }

    // Siempre asignar la sucursal actual
    this.usuario.idSucursal = this.idSucursalActual;

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    const u = this.usuario;

    if (!u.rolId) {
      Swal.fire('Error', 'Debe seleccionar un rol', 'error');
      return;
    }

    const dto = {
      idUsuario: u.idUsuario,
      nombre: u.nombre,
      apellidos: u.apellidos,
      username: u.username,
      email: u.email,
      dni: u.dni,
      turno: u.turno,
      estado: u.estado ? 1 : 0,
      rolId: u.rolId,
      idSucursal: u.idSucursal,
      password: u.password
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
        next: () => {
          Swal.fire('Eliminado', 'Usuario eliminado', 'success');
          this.cargarUsuarios();
        },
        error: err => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error')
      });
    });
  }

  private crearUsuarioVacio(): any {
    return {
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
      idSucursal: null,
      password: ''
    };
  }
}
