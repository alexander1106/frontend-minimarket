import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
 constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarProductos(): Observable<any> {
    return this.http.get(`${baseUrl}/productos`);
  }
}
