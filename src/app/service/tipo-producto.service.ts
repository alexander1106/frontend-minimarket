// src/app/service/tipoproducto.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class TipoProductoService {
  private apiPath = `${baseUrl}/tipoproducto`;

  constructor(private http: HttpClient) {}

  listarTipos(): Observable<any> {
    return this.http.get(`${baseUrl}/tipoproducto`);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/tipoproducto/${id}`);
  }

  registrar(tipo: any): Observable<any> {
    return this.http.post(`${baseUrl}/tipoproducto`, tipo );
  }

  editar(tipo: any): Observable<any> {
    return this.http.put(`${baseUrl}/tipoproducto/`, tipo);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/tipoproducto/${id}`,{ responseType: 'text' });
  }
}