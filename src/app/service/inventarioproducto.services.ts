import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class InventarioProductoService {
  private apiPath = `${baseUrl}/inventarioproducto`;

  constructor(private http: HttpClient) {}

  listarInventarioproducto(): Observable<any> {
    return this.http.get(`${baseUrl}/inventarioproducto`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/inventarioproducto/${id}`);
  }

  registrar(invp: any): Observable<any> {
    return this.http.post(`${baseUrl}/inventarioproducto`, invp );
  }

  editar(invp: any): Observable<any> {
    return this.http.put(`${baseUrl}/inventarioproducto`, invp);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/inventarioproducto/${id}`,{ responseType: 'text' });
  }
}
