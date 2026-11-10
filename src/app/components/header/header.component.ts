import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from '../../service/login.service';
import { CampanaComponent } from '../campana/campana.component';
import { MenuUsuarioComponent } from '../menu-usuario/menu-usuario.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CampanaComponent, MenuUsuarioComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  empresaNombre: string = '';
  username: string = '';
  userRole: string = '';
  ruc: string = '';
  sucursal: string = '';
  cajaNombre: string = '';
  mostrarCaja = false;
  esSuper = false;

  tituloPagina = 'Dashboard Principal';
  tituloNormal = 'Dashboard';
  hoy = new Date();
  busqueda = '';

  constructor(private loginService: LoginService, private router: Router) {}

  private titulos: Record<string, string> = {
    '/admin': 'Dashboard Principal',
    '/admin/empresas': 'Gestión de Empresas',
    '/admin/sucursales': 'Gestión de Sucursales',
    '/admin/roles': 'Roles y Permisos',
    '/admin/usuarios': 'Propietarios y Usuarios',
    '/admin/notificaciones': 'Notificaciones',
    '/admin/auditoria': 'Auditoría',
    '/admin/perfil': 'Mi perfil',
  };

  private actualizarTitulo(url: string): void {
    const ruta = url.split('?')[0].replace(/\/$/, '');
    this.tituloPagina = this.titulos[ruta] || 'Panel de administración';
    this.tituloNormal = this.tituloDeRuta(ruta);
  }

  private tituloDeRuta(ruta: string): string {
    const conocidos: Record<string, string> = {
      'admin': 'Dashboard', 'usuarios': 'Usuarios', 'roles': 'Roles', 'inventario': 'Inventario',
      'inventarioproducto': 'Inventario por producto', 'ajuste-inventario': 'Ajustes de inventario',
      'traslado-inventario-producto': 'Traslado de inventario', 'almacenes': 'Almacenes',
      'unidades-medida': 'Unidades de medida', 'tipoproducto': 'Tipos de producto', 'categorias': 'Categorías',
      'productos': 'Productos', 'list-venta': 'Ventas', 'add-ventas': 'Nueva venta', 'list-cotizaciones': 'Cotizaciones',
      'list-clientes': 'Clientes', 'metodos-pago': 'Métodos de pago', 'metodos-pago-catalogo': 'Métodos de pago', 'list-delivery': 'Delivery',
      'list-cajas': 'Cajas', 'list-apertura': 'Apertura de caja', 'pagos': 'Pagos',
      'reporte-ventas': 'Reporte de ventas', 'reporte-almacenes': 'Reporte de almacenes',
      'empresas': 'Empresas', 'planes': 'Planes', 'sucursales': 'Sucursales', 'compras': 'Compras', 'kardex': 'Kardex', 'proveedores': 'Proveedores',
      'nueva': 'Nueva compra', 'notificaciones': 'Notificaciones', 'auditoria': 'Auditoría', 'perfil': 'Mi perfil',
    };
    const seg = ruta.split('/').filter(Boolean);
    if (seg.length > 1 && /^\d+$/.test(seg[seg.length - 1])) seg.pop();
    const ult = seg.find((x, i) => i === seg.length - 1) || 'admin';
    if (ult === 'editar') return 'Editar compra';
    return conocidos[ult] || ult.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
  }

  buscar(): void {
    const q = this.busqueda.trim();
    this.router.navigate(['/admin/empresas'], { queryParams: q ? { q } : {} });
  }

  registrarEmpresa(): void {
    this.router.navigate(['/admin/empresas'], { queryParams: { nuevo: Date.now() } });
  }

  ngOnInit() {
    const empresa = this.loginService.getEmpresa();
    if (empresa) {
      if (typeof empresa === 'object' && (empresa.nombreComercial || empresa.razonsocial)) {
        this.empresaNombre = empresa.nombreComercial || empresa.razonsocial;
        this.ruc = empresa.ruc || '';
      } else if (typeof empresa === 'string') {
        this.empresaNombre = empresa;
      } else {
        this.empresaNombre = '';
      }
    }

    const username = this.loginService.getUsername();
    if (username) {
      this.username = username;
    } else {
      const user = this.loginService.getUser();
      if (user && user.nombre) {
        this.username = user.nombre;
      }
    }

    const modulos = this.loginService.getModulosPermitidos();
    this.mostrarCaja = modulos
      ? modulos.includes('Caja')
      : this.loginService.hasAnyRole(['ADMIN', 'CAJERO', 'EMPRESA']);

    this.esSuper = this.loginService.hasRole('SUPERADMIN');
    this.actualizarTitulo(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.actualizarTitulo(e.urlAfterRedirects || e.url));
    const user = this.loginService.getUser();
    this.sucursal = user?.sucursal?.nombreSucursal || user?.sucursal?.nombre || '';
    try {
      const caja = JSON.parse(localStorage.getItem('cajaActiva') || 'null');
      this.cajaNombre = caja?.nombreCaja || '';
    } catch { this.cajaNombre = ''; }

    const rol = this.loginService.getUserRole();
    if (rol) {
      this.userRole = rol;
    }
  }
}
