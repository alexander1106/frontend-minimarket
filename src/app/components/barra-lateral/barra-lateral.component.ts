import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Importar esto
import { Router, RouterModule } from '@angular/router'; // <-- IMPORTANTE
import { LoginService } from '../../service/login.service';
import ColorThief from 'color-thief';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule,RouterModule], // ✅ Agregar aquí
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent {
  constructor(private loginService: LoginService, private router: Router) {}

  activeMenu: string | null = null;
empresaColor = '#000000'; // Color por defecto

  toggleSubmenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  cerrarSesion() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
  empresa: any = null;

ngOnInit() {
  this.empresa = this.loginService.getEmpresa();
  console.log("Empresa en sidebar:", this.empresa);
}


  tieneRol(role: string): boolean {
    return this.loginService.hasRole(role);
  }


tieneRolesPermitidos(roles: string[]): boolean {
  return this.loginService.hasAnyRole(roles);
}


}
