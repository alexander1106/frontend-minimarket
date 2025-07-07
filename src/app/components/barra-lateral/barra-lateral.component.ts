import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent implements OnInit {
  constructor(private loginService: LoginService, private router: Router) {}

  activeMenu: string | null = null;
  empresaColor = '#000000'; // Color por defecto
  empresa: any = null;

  ngOnInit() {
    this.empresa = this.loginService.getEmpresa();
    console.log("Empresa cargada:", this.empresa);

    if (this.empresa && this.empresa.logo) {
      this.empresaColor = this.empresa.logo;
    }
  }

  toggleSubmenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  cerrarSesion() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  tieneRol(role: string): boolean {
    return this.loginService.hasRole(role);
  }

  tieneRolesPermitidos(roles: string[]): boolean {
    return this.loginService.hasAnyRole(roles);
  }
}
