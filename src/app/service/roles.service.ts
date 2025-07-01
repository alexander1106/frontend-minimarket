import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private apiPath = `${baseUrl}/roles`;

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<any> {
    return this.http.get(`${baseUrl}/roles`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/roles/${id}`);
  }

  registrar(rol: any): Observable<any> {
    return this.http.post(`${baseUrl}/roles`, rol);
  }

  editar(rol: any): Observable<any> {
    return this.http.put(`${baseUrl}/roles`, rol);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/roles/${id}`, { responseType: 'text' });
  }

}
