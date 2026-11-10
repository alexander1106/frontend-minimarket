import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({ providedIn: 'root' })
export class SuperadminGuard implements CanActivate {
  constructor(private router: Router, private loginService: LoginService) {}

  canActivate(): boolean {
    if (this.loginService.hasRole('SUPERADMIN')) return true;
    this.router.navigate(['/admin']);
    return false;
  }
}
