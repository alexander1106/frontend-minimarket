import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private apiPath = `${baseUrl}/categorias`;

  constructor(private http: HttpClient) {}

  listarCategorias(): Observable<any> {
    return this.http.get(`${baseUrl}/categorias`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/categorias/${id}`);
  }

  registrar(cat: any): Observable<any> {
    return this.http.post(`${baseUrl}/categorias`, cat );
  }

  editar(cat: any): Observable<any> {
    return this.http.put(`${baseUrl}/categorias"/`, cat);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/categorias/${id}`,{ responseType: 'text' });
  }
}