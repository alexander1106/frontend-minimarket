// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${baseUrl}`;

  constructor(private http: HttpClient) {}

  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/usuarios/`, usuario);
  }

  generarToken(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, {
      username,
      password
    });
  }

isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  console.log('¿Está autenticado?', !!token);
  return !!token;
}

  registrarConToken(usuario: any): Observable<string> {
    return this.registrar(usuario).pipe(
      switchMap(() =>
        this.generarToken(usuario.username, usuario.password).pipe(
          map((resp: any) => resp.token)
        )
      )
    );
  }
}
