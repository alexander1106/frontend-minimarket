import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { EmpresasService } from '../../service/empresas.service';

// Respaldo si no se pueden leer los módulos del backend (coincide con los datos iniciales del API)
const MODULOS_RESPALDO: Record<string, string[]> = {
  Administrable: ['SUPERADMIN'],
  Dashboard: ['ADMIN', 'SUPERVISOR', 'EMPRESA'],
  Seguridad: ['ADMIN', 'EMPRESA'],
  Inventario: ['ADMIN', 'ALMACENERO', 'EMPRESA'],
  Almacenes: ['ADMIN', 'ALMACENERO', 'EMPRESA'],
  Productos: ['ADMIN', 'ALMACENERO', 'EMPRESA'],
  Compras: ['ADMIN', 'ALMACENERO', 'EMPRESA'],
  Ventas: ['ADMIN', 'CAJERO', 'EMPRESA'],
  Delivery: ['ADMIN', 'SUPERVISOR', 'CAJERO', 'EMPRESA'],
  Caja: ['ADMIN', 'CAJERO', 'EMPRESA'],
  Reportes: ['ADMIN', 'CAJERO', 'EMPRESA'],
};

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router, private empresasService: EmpresasService) {}

  totalEmpresas = 0;

  activeMenu: string | null = null;
  empresaColor: string | null = null;
  empresa: any = null;
  logoBase64: string | null = null;

  modulosPermitidos: string[] | null = null;

  ngOnInit() {
    this.modulosPermitidos = this.loginService.getModulosPermitidos();
    this.loginService.cargarModulosPermitidos().subscribe({
      next: nombres => (this.modulosPermitidos = nombres),
      error: () => { /* se mantiene lo guardado o el respaldo */ }
    });

    if (this.loginService.hasRole('SUPERADMIN')) {
      this.empresasService.listarEmpresas().subscribe({
        next: (d: any) => (this.totalEmpresas = Array.isArray(d) ? d.length : 0),
        error: () => (this.totalEmpresas = 0)
      });
    }

    this.empresa = this.loginService.getEmpresa();
    console.log("Empresa cargada:", this.empresa);

    const idEmpresa = this.empresa?.idempresa ?? this.empresa?.idEmpresa;
    if (idEmpresa && !this.loginService.hasRole('SUPERADMIN')) {
      const clave = `empresaLogo_${idEmpresa}`;
      try { this.logoBase64 = localStorage.getItem(clave); } catch { }
      this.empresasService.buscar(idEmpresa).subscribe({
        next: (e: any) => {
          this.logoBase64 = e?.logo ? `data:image/png;base64,${e.logo}` : null;
          try {
            if (this.logoBase64) localStorage.setItem(clave, this.logoBase64);
            else localStorage.removeItem(clave);
          } catch { }
        },
        error: () => { }
      });
    }

    if (this.empresa && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(this.empresa.logo || '')) {
      this.empresaColor = this.empresa.logo;
    }
  }

  get inicialesEmpresa(): string {
    return this.nombreEmpresa.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  }

  get nombreEmpresa(): string {
    return this.empresa?.nombreComercial || this.empresa?.razonsocial || this.empresa?.nombre || '';
  }

  get logoSrc(): string | null {
    return this.logoBase64;
  }

  toggleSubmenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  cerrarSesion() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  puedeVer(modulo: string): boolean {
    if (this.modulosPermitidos) return this.modulosPermitidos.includes(modulo);
    return this.loginService.hasAnyRole(MODULOS_RESPALDO[modulo] || []);
  }

  grupoVisible(modulos: string[]): boolean {
    return modulos.some(m => this.puedeVer(m)) && !this.puedeVer('Administrable');
  }

  tieneRol(role: string): boolean {
    return this.loginService.hasRole(role);
  }

  tieneRolesPermitidos(roles: string[]): boolean {
    return this.loginService.hasAnyRole(roles);
  }
}
