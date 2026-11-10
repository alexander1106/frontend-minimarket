import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { Observable, tap } from 'rxjs';
import baseUrl from '../components/link';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor{

  constructor(private loginService:LoginService, private router: Router) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.loginService.getToken();

    if (!req.url.startsWith(baseUrl)) {
      return next.handle(req);
    }

    if(token != null){
      authReq = authReq.clone({
        setHeaders : {Authorization: `Bearer ${token}` }
      })
    }
    return next.handle(authReq).pipe(
      tap({
        error: (err) => {
          if (!(err instanceof HttpErrorResponse)) return;
          const esLogin = req.url.endsWith('/login');
          const esCatalogo = /\/(unidad_medida|categorias|tipoproducto)(\/|$)/.test(req.url);

          // El backend responde 403 (no 401) a un token vencido: se detecta por la fecha del token
          const sesionVencida = !esLogin && token != null && !this.loginService.tokenVigente();
          if ((err.status === 401 || (err.status === 403 && sesionVencida)) && !esLogin) {
            this.loginService.logout();
            this.router.navigate(['/login']);
          }

          if (err.status === 403 && !esLogin && !sesionVencida && req.method !== 'GET') {
            Swal.fire({
              icon: 'warning',
              title: 'Sin permisos',
              text: esCatalogo ? 'Solo el superadmin puede modificar este catálogo' : 'No tienes permisos para esta operación',
              confirmButtonText: 'Aceptar'
            });
          }
        }
      })
    );
  }

}

export const authInterceptorProviders = [
  {
    provide : HTTP_INTERCEPTORS,
    useClass : AuthInterceptor,
    multi : true
  }
]
