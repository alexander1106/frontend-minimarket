import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  constructor(private http: HttpClient) { }

  // Obtener todos los proveedores
  public buscarTodos(): Observable<any> {
    return this.http.get(`${baseUrl}/proveedores`);
  }

  // Buscar proveedor por ID
  public buscarId(id: any): Observable<any> {
    return this.http.get(`${baseUrl}/proveedores/${id}`);
  }

  // Registrar nuevo proveedor
  public guardar(proveedor: any): Observable<any> {
    return this.http.post(`${baseUrl}/proveedores`, proveedor);
  }

  // Actualizar proveedor
  public actualizar(proveedor: any): Observable<any> {
    return this.http.put(`${baseUrl}/proveedores/${proveedor.idProveedor}`, proveedor);
  }

  // Eliminar un proveedor por ID
  public eliminar(id: any): Observable<any> {
    return this.http.delete(`${baseUrl}/proveedores/${id}`);
  }
}