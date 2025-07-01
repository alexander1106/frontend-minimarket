<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Importar esto
import { Router, RouterModule } from '@angular/router'; // <-- IMPORTANTE
import { LoginService } from '../../service/login.service';

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
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Importar esto
import { Router, RouterModule } from '@angular/router'; // <-- IMPORTANTE
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule,RouterModule], // ✅ Agregar aquí
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent {
  constructor(private loginService:LoginService, private router:Router) { }
  activeMenu: string | null = null;

  cerrarSesion(){
    this.loginService.logout(),
    this.router.navigate(['/login'])
  }
  toggleSubmenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }
}
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c
