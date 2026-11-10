import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { RolesService } from '../../../../service/roles.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';

const MODULOS_SUPERADMIN = ['Administrable', 'Seguridad'];

@Component({
  selector: 'app-list-roles',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, CommonModule, FormsModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.css']
})
export class ListRolesComponent implements OnInit {
  roles: any[] = [];
  modulos: any[] = [];
  filtrados: any[] = [];
  filtro = '';
  pagina = 1;
  porPagina = 5;

  cargando = true;

  seleccion: Record<number, Set<number>> = {};
  private original: Record<number, string> = {};
  guardandoId: number | null = null;

  mostrarModal = false;
  guardando = false;
  rol: any = this.rolVacio();
  modalModulos = new Set<number>();
  errores: Record<string, string> = {};
  avisoModal = '';

  constructor(private svc: RolesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private rolVacio() {
    return { id: 0, nombre: '', sistema: false };
  }

  cargar(): void {
    this.cargando = true;
    forkJoin({ roles: this.svc.listarRoles(), modulos: this.svc.listarModulos() }).subscribe({
      next: r => {
        this.roles = Array.isArray(r.roles) ? r.roles : [];
        this.modulos = (Array.isArray(r.modulos) ? r.modulos : []).filter((m: any) => m.estado !== 0);
        this.roles.forEach(x => this.sincronizar(x));
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }

  private sincronizar(r: any): void {
    const ids = (r.modulos || []).map((m: any) => m.idModulo);
    this.seleccion[r.id] = new Set<number>(ids);
    this.original[r.id] = this.firma(this.seleccion[r.id]);
  }

  private firma(s: Set<number>): string {
    return [...s].sort((a, b) => a - b).join(',');
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t ? this.roles.filter(r => r.nombre.toLowerCase().includes(t)) : [...this.roles];
  }

  get totalSistema(): number { return this.roles.filter(r => r.sistema).length; }
  get totalPersonalizados(): number { return this.roles.length - this.totalSistema; }

  esSuperadmin(r: any): boolean { return r.nombre === 'SUPERADMIN'; }

  marcado(r: any, m: any): boolean {
    return !!this.seleccion[r.id]?.has(m.idModulo);
  }

  bloqueado(r: any, m: any): boolean {
    if (!this.esSuperadmin(r)) return false;
    return !MODULOS_SUPERADMIN.includes(m.nombre) || m.nombre === 'Administrable';
  }

  alternar(r: any, m: any): void {
    if (this.bloqueado(r, m)) return;
    const s = this.seleccion[r.id];
    if (s.has(m.idModulo)) s.delete(m.idModulo); else s.add(m.idModulo);
  }

  cambiado(r: any): boolean {
    return this.firma(this.seleccion[r.id] || new Set()) !== this.original[r.id];
  }

  cantidadModulos(r: any): number {
    return this.seleccion[r.id]?.size || 0;
  }

  guardarFila(r: any): void {
    this.guardandoId = r.id;
    this.svc.guardarModulos(r.id, [...this.seleccion[r.id]]).subscribe({
      next: (rol: any) => {
        this.guardandoId = null;
        Object.assign(r, rol);
        this.sincronizar(r);
        Swal.fire({ icon: 'success', title: 'Permisos guardados', text: `Rol ${r.nombre}`, timer: 1600, showConfirmButton: false });
      },
      error: (err: any) => {
        this.guardandoId = null;
        Swal.fire('Error', this.mensaje(err), 'error');
      }
    });
  }

  descartarFila(r: any): void {
    this.sincronizar(r);
  }

  puedeEliminar(r: any): boolean {
    return !r.sistema && !(r.cantidadUsuarios > 0);
  }

  motivoNoEliminar(r: any): string {
    if (r.sistema) return 'Los roles del sistema no se pueden eliminar';
    if (r.cantidadUsuarios > 0) return 'Primero reasigna los usuarios de este rol';
    return 'Eliminar';
  }

  eliminar(r: any): void {
    if (!this.puedeEliminar(r)) return;
    Swal.fire({
      title: `¿Eliminar el rol ${r.nombre}?`,
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(r.id).subscribe({
        next: () => { Swal.fire('Eliminado', 'Rol eliminado', 'success'); this.cargar(); },
        error: (err: any) => Swal.fire('Error', this.mensaje(err), 'error')
      });
    });
  }

  abrirModal(r?: any): void {
    this.errores = {};
    this.avisoModal = '';
    this.rol = r ? { id: r.id, nombre: r.nombre, sistema: r.sistema } : this.rolVacio();
    this.modalModulos = new Set<number>();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  alternarModal(m: any): void {
    if (this.modalModulos.has(m.idModulo)) this.modalModulos.delete(m.idModulo);
    else this.modalModulos.add(m.idModulo);
  }

  formSubmit(): void {
    const nombre = (this.rol.nombre || '').trim();
    this.errores = {};
    this.avisoModal = '';
    if (nombre.length < 3) {
      this.errores['nombre'] = 'El nombre debe tener entre 3 y 30 caracteres.';
      return;
    }

    this.guardando = true;
    const edita = this.rol.id > 0;
    const pet$ = edita
      ? this.svc.editar({ id: this.rol.id, nombre })
      : this.svc.registrar({ nombre, modulos: [...this.modalModulos] });

    pet$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        Swal.fire({ icon: 'success', title: edita ? 'Rol actualizado' : 'Rol registrado', timer: 1600, showConfirmButton: false });
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        const campos = err?.error?.errors;
        if (campos && typeof campos === 'object') this.errores = campos;
        this.avisoModal = err?.error?.message || err?.error?.error || 'No se pudo guardar el rol';
      }
    });
  }

  private mensaje(err: any): string {
    return err?.error?.message || err?.error?.error || 'Error inesperado';
  }
}
