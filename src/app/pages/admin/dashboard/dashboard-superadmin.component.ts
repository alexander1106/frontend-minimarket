import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { LoginService } from '../../../service/login.service';
import { EmpresasService } from '../../../service/empresas.service';
import { SucursalesService } from '../../../service/sucursales.service';
import { UsuariosService } from '../../../service/usuarios.service';
import { RolesService } from '../../../service/roles.service';

interface Mes { etiqueta: string; total: number; alto: number; actual: boolean; }
interface Porcion { rol: string; cantidad: number; porcentaje: number; color: string; }

@Component({
  selector: 'app-dashboard-superadmin',
  standalone: true,
  imports: [CommonModule, RouterLink, BarraLateralComponent, HeaderComponent],
  templateUrl: './dashboard-superadmin.component.html',
  styleUrl: './dashboard-superadmin.component.css'
})
export class DashboardSuperadminComponent implements OnInit {
  nombre = '';
  cargando = true;

  empresas: any[] = [];
  sucursales: any[] = [];
  usuarios: any[] = [];
  roles: any[] = [];

  meses: Mes[] = [];
  porciones: Porcion[] = [];
  donut = 'conic-gradient(#e5e7eb 0 100%)';
  filas: any[] = [];

  private colores = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#64748b'];

  constructor(
    private loginService: LoginService,
    private empresasService: EmpresasService,
    private sucursalesService: SucursalesService,
    private usuariosService: UsuariosService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.nombre = this.loginService.getUser()?.nombre || '';
    forkJoin({
      empresas: this.empresasService.listarEmpresas().pipe(catchError(() => of([]))),
      sucursales: this.sucursalesService.listarSucursales().pipe(catchError(() => of([]))),
      usuarios: this.usuariosService.listarUsuarios().pipe(catchError(() => of([]))),
      roles: this.rolesService.listarRoles().pipe(catchError(() => of([])))
    }).subscribe(r => {
      this.empresas = Array.isArray(r.empresas) ? r.empresas : [];
      this.sucursales = Array.isArray(r.sucursales) ? r.sucursales : [];
      this.usuarios = Array.isArray(r.usuarios) ? r.usuarios : [];
      this.roles = Array.isArray(r.roles) ? r.roles : [];
      this.armarGraficos();
      this.cargando = false;
    });
  }

  get empresasActivas(): number { return this.empresas.filter(e => e.estado === 1).length; }
  get empresasInactivas(): number { return this.empresas.length - this.empresasActivas; }
  get sucursalesActivas(): number { return this.sucursales.filter(s => s.estado === 1).length; }
  get usuariosHabilitados(): number { return this.usuarios.filter(u => u.enable !== false && u.enabled !== false).length; }
  get sinSucursal(): number { return this.empresas.filter(e => this.sucursalesDe(e) === 0).length; }

  sucursalesDe(e: any): number {
    return this.sucursales.filter(s =>
      (s.id_empresa ?? s.idEmpresa) === e.idempresa || (s.empresaNombre && s.empresaNombre === e.razonsocial)).length;
  }

  iniciales(nombre: string): string {
    const p = (nombre || '?').trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || p[0]?.[1] || '')).toUpperCase();
  }

  private armarGraficos(): void {
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const serie: Mes[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = this.empresas.filter(e => String(e.fechaRegistro || '').slice(0, 7) === clave).length;
      serie.push({ etiqueta: `${nombres[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, total, alto: 0, actual: i === 0 });
    }
    const max = Math.max(...serie.map(s => s.total), 1);
    serie.forEach(s => (s.alto = Math.max(4, Math.round((s.total / max) * 100))));
    this.meses = serie;

    const conteo = new Map<string, number>();
    this.usuarios.forEach(u => {
      const rol = u.rol?.nombre || 'SIN ROL';
      conteo.set(rol, (conteo.get(rol) || 0) + 1);
    });
    const total = this.usuarios.length || 1;
    let acumulado = 0;
    const tramos: string[] = [];
    this.porciones = [...conteo.entries()].sort((a, b) => b[1] - a[1]).map(([rol, cantidad], i) => {
      const color = this.colores[i % this.colores.length];
      const porcentaje = Math.round((cantidad / total) * 100);
      const ini = acumulado;
      acumulado += (cantidad / total) * 100;
      tramos.push(`${color} ${ini}% ${acumulado}%`);
      return { rol, cantidad, porcentaje, color };
    });
    this.donut = tramos.length ? `conic-gradient(${tramos.join(', ')})` : 'conic-gradient(#e5e7eb 0 100%)';

    this.filas = [...this.empresas]
      .map(e => ({ ...e, nSuc: this.sucursalesDe(e), atencion: e.estado !== 1 || this.sucursalesDe(e) === 0 }))
      .sort((a, b) => Number(b.atencion) - Number(a.atencion) ||
        String(b.fechaRegistro || '').localeCompare(String(a.fechaRegistro || '')))
      .slice(0, 6);
  }
}
