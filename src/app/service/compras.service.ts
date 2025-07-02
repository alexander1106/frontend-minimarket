import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private http: HttpClient) { }

  // Guardar una nueva compra
  guardarCompra(compra: any): Observable<any> {
    return this.http.post(`${baseUrl}/compras`, compra);
  }

  // Editar una compra existente
  editarCompra(compra: any): Observable<any> {
    return this.http.put(`${baseUrl}/compras`, compra);
  }

  // Eliminar una compra por ID
  eliminarCompra(idCompra: number): Observable<any> {
    return this.http.delete(`${baseUrl}/compras/${idCompra}`, { responseType: 'text' });
  }

  // Buscar una compra por ID
  buscarCompra(idCompra: number): Observable<any> {
    return this.http.get(`${baseUrl}/compras/${idCompra}`);
  }

  // Listar todas las compras
  listarCompras(): Observable<any> {
    return this.http.get(`${baseUrl}/compras`);
  }

  // Obtener compras por proveedor
  obtenerComprasPorProveedor(idProveedor: number): Observable<any> {
    return this.http.get(`${baseUrl}/compras/proveedor/${idProveedor}`);
  }
}