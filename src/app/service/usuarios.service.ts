import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiPath = `${baseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<any> {
    return this.http.get(`${baseUrl}/usuarios`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/usuarios/${id}`);
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${baseUrl}/usuarios`, usuario);
  }

  editar(usuario: any): Observable<any> {
    return this.http.put(`${baseUrl}/usuarios`, usuario);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/usuarios/${id}`, { responseType: 'text' });
  }

}
