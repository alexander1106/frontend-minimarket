// src/app/guards/access.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const tryingToAccess = route.routeConfig?.path;

    // Si intenta entrar al login y ya tiene token, lo redirigimos al admin
    if (tryingToAccess === 'login' && token) {
      this.router.navigate(['/admin']);
      return false;
    }

    // Si intenta entrar a rutas privadas sin token, lo mandamos al login
    if (tryingToAccess?.startsWith('admin') && !token) {
      this.router.navigate(['/login']);
      return false;
    }

    // En cualquier otro caso, dejar pasar
    return true;
  }
}
