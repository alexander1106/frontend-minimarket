import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiPath = `${baseUrl}/inventario`;

  constructor(private http: HttpClient) {}

  listarInventario(): Observable<any> {
    return this.http.get(`${baseUrl}/inventario`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/inventario/${id}`);
  }

  registrar(inv: any): Observable<any> {
    return this.http.post(`${baseUrl}/inventario`, inv );
  }

  editar(inv: any): Observable<any> {
    return this.http.put(`${baseUrl}/inventario`, inv);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/inventario/${id}`,{ responseType: 'text' });
  }
}
