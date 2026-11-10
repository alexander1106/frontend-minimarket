import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-menu-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-usuario.component.html',
  styleUrl: './menu-usuario.component.css'
})
export class MenuUsuarioComponent implements OnInit {
  abierto = false;

  username = '';
  nombreCompleto = '';
  correo = '';
  rol = '';
  empresa = '';
  ruc = '';
  sucursal = '';
  esSuper = false;

  constructor(private loginService: LoginService, private router: Router, private el: ElementRef) {}

  ngOnInit(): void {
    const user = this.loginService.getUser();
    const empresa = this.loginService.getEmpresa();
    this.username = this.loginService.getUsername() || user?.username || user?.nombre || '';
    this.nombreCompleto = [user?.nombre, user?.apellidos || user?.apellido].filter(Boolean).join(' ').trim();
    this.correo = user?.correo || user?.email || '';
    this.rol = this.loginService.getUserRole() || '';
    this.esSuper = this.loginService.hasRole('SUPERADMIN');
    if (empresa && typeof empresa === 'object') {
      this.empresa = empresa.nombreComercial || empresa.razonsocial || '';
      this.ruc = empresa.ruc || '';
    }
    this.sucursal = user?.sucursal?.nombreSucursal || user?.sucursal?.nombre || '';
  }

  get iniciales(): string {
    return (this.username || '?').slice(0, 2).toUpperCase();
  }

  alternar(): void {
    this.abierto = !this.abierto;
  }

  cerrarSesion(): void {
    this.abierto = false;
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

  @HostListener('document:click', ['$event'])
  fuera(e: Event): void {
    if (this.abierto && !this.el.nativeElement.contains(e.target)) this.abierto = false;
  }

  @HostListener('document:keydown.escape')
  esc(): void {
    this.abierto = false;
  }
}
