import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { LoginService } from '../../../service/login.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, BarraLateralComponent, HeaderComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  username = '';
  nombre = '';
  correo = '';
  rol = '';
  empresa = '';
  ruc = '';
  sucursal = '';
  modulos: string[] = [];
  esSuper = false;
  sesionPersistente = true;
  logo: string | null = null;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    const user = this.loginService.getUser();
    const empresa = this.loginService.getEmpresa();
    this.username = this.loginService.getUsername() || user?.username || '';
    this.nombre = [user?.nombre, user?.apellidos || user?.apellido].filter(Boolean).join(' ').trim() || this.username;
    this.correo = user?.correo || user?.email || '';
    this.rol = this.loginService.getUserRole() || '';
    this.esSuper = this.loginService.hasRole('SUPERADMIN');
    this.modulos = this.esSuper
      ? ['Dashboard', 'Empresas', 'Sucursales', 'Planes', 'Unidades de medida', 'Categorías', 'Tipos de producto',
         'Métodos de pago', 'Propietarios y usuarios', 'Roles y permisos', 'Auditoría', 'Notificaciones']
      : (this.loginService.getModulosPermitidos() || []);
    this.sesionPersistente = localStorage.getItem('sesionTemporal') !== '1';
    if (empresa && typeof empresa === 'object') {
      this.empresa = empresa.nombreComercial || empresa.razonsocial || '';
      this.ruc = empresa.ruc || '';
      const id = empresa.idempresa ?? empresa.idEmpresa;
      try { this.logo = id ? localStorage.getItem(`empresaLogo_${id}`) : null; } catch { }
    }
    this.sucursal = user?.sucursal?.nombreSucursal || user?.sucursal?.nombre || '';
  }

  get iniciales(): string {
    return (this.nombre || this.username || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  cerrarSesion(): void {
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Seguro que quieres salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.loginService.logout();
      this.router.navigate(['/login']);
    });
  }
}
