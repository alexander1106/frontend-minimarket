import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private router: Router, private loginService: LoginService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Un token vencido cuenta como sesión cerrada: se limpia para no mostrar datos de una sesión muerta
    if (localStorage.getItem('token') && !this.loginService.tokenVigente()) {
      this.loginService.logout();
    }
    const token = localStorage.getItem('token');
    const tryingToAccess = route.routeConfig?.path;

    if (tryingToAccess === 'login' && token) {
      this.router.navigate(['/admin']);
      return false;
    }

    if (tryingToAccess?.startsWith('admin') && !token) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
