import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class AjusteInventarioService {
  private apiPath = `${baseUrl}/ajustes`;

  constructor(private http: HttpClient) {}

  listarAjustes(): Observable<any> {
    return this.http.get(`${baseUrl}/ajustes`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/ajustes/${id}`);
  }

  registrar(ajuste: any): Observable<any> {
    return this.http.post(`${baseUrl}/ajustes`, ajuste);
  }

  editar(ajuste: any): Observable<any> {
    return this.http.put(`${baseUrl}/ajustes`, ajuste);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/ajustes/${id}`, { responseType: 'text' });
  }

}
