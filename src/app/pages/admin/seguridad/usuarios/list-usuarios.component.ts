import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { UsuariosService } from '../../../../service/usuarios.service';
import { RolesService } from '../../../../service/roles.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { LoginService } from '../../../../service/login.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';

interface FormUsuario {
  idUsuario: number;
  rolId: number | null;
  idEmpresa: number | null;
  idSucursal: number | null;
  nombre: string;
  apellidos: string;
  username: string;
  password: string;
  email: string;
  dni: string;
  turno: string;
}

const ETIQUETAS_ROL: Record<string, string> = {
  EMPRESA: 'Propietario',
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
  ALMACENERO: 'Almacenero',
  SUPERVISOR: 'Supervisor',
  SUPERADMIN: 'Superadministrador'
};

@Component({
  selector: 'app-list-usuarios',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, CommonModule, FormsModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-usuarios.component.html',
  styleUrls: ['./list-usuarios.component.css']
})
export class ListUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  filtrados: any[] = [];
  roles: any[] = [];
  private rolesDelServidor: any[] | null = null;
  sucursales: any[] = [];

  esSuper = false;
  cargando = true;

  filtro = '';
  pagina = 1;
  porPagina = 5;

  filtroRol = '';
  filtroEmpresa = '';

  mostrarModal = false;
  guardando = false;
  errores: Record<string, string> = {};
  form: FormUsuario = this.vacio();

  constructor(
    private svc: UsuariosService,
    private rolSvc: RolesService,
    private sucSvc: SucursalesService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.esSuper = this.loginService.hasRole('SUPERADMIN');
    this.cargar();
  }

  private cargar(): void {
    forkJoin({
      usuarios: this.svc.listarUsuarios().pipe(catchError(() => of([]))),
      roles: this.rolSvc.listarRoles().pipe(catchError(() => of([]))),
      asignables: this.rolSvc.asignables().pipe(catchError(() => of(null))),
      sucursales: this.sucSvc.listarSucursales().pipe(catchError(() => of([])))
    }).subscribe(r => {
      this.roles = Array.isArray(r.roles) ? r.roles : [];
      this.rolesDelServidor = Array.isArray(r.asignables) ? r.asignables : null;
      this.sucursales = Array.isArray(r.sucursales) ? r.sucursales : [];

      const sucPorId = new Map<number, any>(this.sucursales.map(s => [s.idSucursal, s]));
      let lista: any[] = (Array.isArray(r.usuarios) ? r.usuarios : []).map((u: any) => {
        const s = sucPorId.get(u.sucursal?.idSucursal);
        return {
          ...u,
          empresaId: s ? (s.id_empresa ?? s.idEmpresa) : null,
          empresaNombre: s?.empresaNombre || null,
          sucursalNombre: u.sucursal?.nombreSucursal || s?.nombreSucursal || null
        };
      });

      if (!this.esSuper) {
        const miSuc = this.loginService.getUser()?.sucursal?.idSucursal;
        const miEmpresa = sucPorId.get(miSuc);
        const idEmpresa = miEmpresa ? (miEmpresa.id_empresa ?? miEmpresa.idEmpresa) : null;
        lista = lista.filter(u => u.empresaId === idEmpresa);
      }
      this.usuarios = lista;
      this.cargando = false;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    const q = this.filtro.trim().toLowerCase();
    this.filtrados = this.usuarios.filter(u => {
      const texto = [u.nombre, u.apellidos, u.username, u.email, u.empresaNombre, u.dni]
        .filter(Boolean).join(' ').toLowerCase();
      return (!q || texto.includes(q))
        && (!this.filtroRol || u.rol?.nombre === this.filtroRol)
        && (!this.filtroEmpresa || String(u.empresaId) === this.filtroEmpresa);
    });
  }

  get propietarios(): number { return this.usuarios.filter(u => u.rol?.nombre === 'EMPRESA').length; }
  get colaboradores(): number { return this.usuarios.filter(u => u.rol?.nombre !== 'EMPRESA' && u.rol?.nombre !== 'SUPERADMIN').length; }
  get activos(): number { return this.usuarios.filter(u => this.estaActivo(u)).length; }
  get tasaActivos(): number { return this.usuarios.length ? Math.round((this.activos / this.usuarios.length) * 100) : 0; }

  get empresasFiltro(): { id: number; nombre: string }[] {
    const m = new Map<number, string>();
    this.usuarios.forEach(u => { if (u.empresaId != null && u.empresaNombre) m.set(u.empresaId, u.empresaNombre); });
    return [...m.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  get sucursalesDelForm(): any[] {
    return this.sucursales.filter(s => (s.id_empresa ?? s.idEmpresa) === this.form.idEmpresa);
  }

  get empresasForm(): { id: number; nombre: string }[] {
    const m = new Map<number, string>();
    this.sucursales.forEach(s => { const id = s.id_empresa ?? s.idEmpresa; if (id != null && s.empresaNombre) m.set(id, s.empresaNombre); });
    return [...m.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  get rolSeleccionadoEsSuper(): boolean {
    return this.roles.find(r => r.id === this.form.rolId)?.nombre === 'SUPERADMIN';
  }

  get rolesAsignables(): any[] {
    if (this.rolesDelServidor) return this.rolesDelServidor;
    return this.esSuper ? this.roles : this.roles.filter(r => r.nombre !== 'SUPERADMIN');
  }

  estaActivo(u: any): boolean { return u.estado === 1 && u.enable !== false; }
  etiquetaRol(nombre?: string): string { return (nombre && ETIQUETAS_ROL[nombre]) || nombre || '—'; }

  nombreCompleto(u: any): string { return [u.nombre, u.apellidos].filter(Boolean).join(' '); }

  iniciales(u: any): string {
    return ((u.nombre?.[0] || '') + (u.apellidos?.[0] || u.nombre?.[1] || '')).toUpperCase() || '?';
  }

  private vacio(): FormUsuario {
    return { idUsuario: 0, rolId: null, idEmpresa: null, idSucursal: null, nombre: '', apellidos: '', username: '', password: '', email: '', dni: '', turno: '' };
  }

  abrirModal(u?: any): void {
    this.errores = {};
    if (u) {
      this.form = {
        idUsuario: u.idUsuario, rolId: u.rol?.id ?? null, idEmpresa: u.empresaId ?? null,
        idSucursal: u.sucursal?.idSucursal ?? null, nombre: u.nombre || '', apellidos: u.apellidos || '',
        username: u.username || '', password: '', email: u.email || '', dni: u.dni || '', turno: u.turno || ''
      };
    } else {
      this.form = this.vacio();
      if (!this.esSuper) {
        const miSuc = this.loginService.getUser()?.sucursal?.idSucursal ?? null;
        const s = this.sucursales.find(x => x.idSucursal === miSuc);
        this.form.idEmpresa = s ? (s.id_empresa ?? s.idEmpresa) : null;
        this.form.idSucursal = miSuc;
      }
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void { this.mostrarModal = false; }

  alCambiarEmpresa(): void {
    this.form.idSucursal = this.sucursalesDelForm.length === 1 ? this.sucursalesDelForm[0].idSucursal : null;
  }

  private validar(): Record<string, string> {
    const f = this.form;
    const e: Record<string, string> = {};
    const nuevo = !f.idUsuario;
    if (!f.rolId) e['rolId'] = 'Selecciona un rol.';
    if (!f.nombre.trim()) e['nombre'] = 'El nombre es obligatorio.';
    if (!f.username.trim()) e['username'] = 'El usuario es obligatorio.';
    if (nuevo && f.password.length < 4) e['password'] = 'La contraseña debe tener al menos 4 caracteres.';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e['email'] = 'Correo no válido.';
    if (!this.rolSeleccionadoEsSuper && !f.idSucursal) e['idSucursal'] = 'Selecciona la empresa y su sucursal.';
    return e;
  }

  guardar(): void {
    this.errores = this.validar();
    if (Object.keys(this.errores).length) return;

    const f = this.form;
    const dto: any = {
      nombre: f.nombre.trim(), apellidos: f.apellidos.trim(), username: f.username.trim(),
      email: f.email.trim(), dni: f.dni.trim(), turno: f.turno.trim(), rolId: f.rolId
    };
    if (!this.rolSeleccionadoEsSuper) dto.idSucursal = f.idSucursal;
    if (f.password) dto.password = f.password;
    if (f.idUsuario) dto.idUsuario = f.idUsuario;

    this.guardando = true;
    (f.idUsuario ? this.svc.editar(dto) : this.svc.registrar(dto)).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', f.idUsuario ? 'Usuario actualizado' : 'Usuario registrado', 'success');
        this.cerrarModal();
        this.cargar();
      },
      error: err => {
        this.guardando = false;
        const e = err.error;
        const msg = typeof e === 'string' ? e : (e?.message || e?.error || 'Error inesperado');
        Swal.fire('Atención', msg, err.status === 409 ? 'warning' : 'error');
      }
    });
  }

  alternarEstado(u: any): void {
    const activar = !this.estaActivo(u);
    Swal.fire({
      title: activar ? '¿Activar usuario?' : '¿Desactivar usuario?',
      text: this.nombreCompleto(u),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: activar ? 'Sí, activar' : 'Sí, desactivar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.editar({ idUsuario: u.idUsuario, estado: activar ? 1 : 0 }).subscribe({
        next: () => this.cargar(),
        error: err => {
          const e = err.error;
          Swal.fire('Error', typeof e === 'string' ? e : (e?.message || 'No se pudo cambiar el estado'), 'error');
        }
      });
    });
  }

  eliminar(u: any): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `${this.nombreCompleto(u)} — no podrás deshacer esto`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(u.idUsuario).subscribe({
        next: () => { Swal.fire('Eliminado', 'Usuario eliminado', 'success'); this.cargar(); },
        error: err => {
          const e = err.error;
          Swal.fire('Error', typeof e === 'string' ? e : (e?.message || 'No se pudo eliminar'), 'error');
        }
      });
    });
  }
}
