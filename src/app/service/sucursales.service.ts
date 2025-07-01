// src/app/services/empresas.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private apiPath = `${baseUrl}/sucursales`;

  constructor(private http: HttpClient) {}

  listarSucursales(): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales/${id}`);
  }

  registrar(sucursal: any): Observable<any> {
    return this.http.post(`${baseUrl}/sucursales`, sucursal);
  }

  editar(sucursal: any): Observable<any> {
    return this.http.put(`${baseUrl}/sucursales`, sucursal);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/sucursales/${id}`, { responseType: 'text' });
  }
  listarTodas(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8080/api/minimarket/sucursales');
}


}
