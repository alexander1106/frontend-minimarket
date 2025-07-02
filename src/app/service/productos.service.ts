import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiPath = `${baseUrl}/productos`;

  constructor(private http: HttpClient) {}

  listarProductos(): Observable<any> {
    return this.http.get(`${this.apiPath}`);
  }



  buscar(id: number): Observable<any> {
    return this.http.get(`${this.apiPath}/${id}`);
  }

  registrar(prod: any): Observable<any> {
    return this.http.post(`${this.apiPath}`, prod);
  }

  editar(prod: any): Observable<any> {
    return this.http.put(`${this.apiPath}`, prod);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiPath}/${id}`, { responseType: 'text' });
  }

  public listarProductosPorSucursal(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/sucursales/${idSucursal}/productos`);
}

listarProductosPorCategoria(idCategoria: any) {
  return this.http.get(`${baseUrl}/productos/${idCategoria}/categoria`);
}

}
