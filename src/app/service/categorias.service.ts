import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

 constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarCategorias(): Observable<any> {
    return this.http.get(`${baseUrl}/categorias`);
  }
}
