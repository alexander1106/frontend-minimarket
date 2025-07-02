import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class AlmacenesService {
  private apiPath = `${baseUrl}/almacenes`;

  constructor(private http: HttpClient) {}

  listarAlmacenes(): Observable<any> {
    return this.http.get(`${baseUrl}/almacenes`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/almacenes/${id}`);
  }

  registrar(almacen: any): Observable<any> {
    return this.http.post(`${baseUrl}/almacenes`, almacen);
  }

  editar(almacen: any): Observable<any> {
    return this.http.put(`${baseUrl}/almacenes`, almacen);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/almacenes/${id}`, { responseType: 'text' });
  }

}
