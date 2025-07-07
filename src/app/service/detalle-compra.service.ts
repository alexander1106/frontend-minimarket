import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class DetalleCompraService {

  constructor(private http: HttpClient) { }

  // Listar todos los detalles de compras
  public listarDetalles(): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-compras`);
  }

  // Buscar detalle por ID
  public buscarDetalleId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-compras/${id}`);
  }

  // Buscar detalles por ID de compra
  public buscarPorIdCompra(idCompra: number): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-compras/compra/${idCompra}`);
  }

  // Registrar nuevo detalle de compra
  public registrarDetalle(detalle: any, idCompra: number, idProducto: number): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-compras/${idCompra}/${idProducto}`, detalle);
  }

  // Editar un detalle de compra existente
  public editarDetalle(detalle: any): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-compras`, detalle);
  }

  // Eliminar un detalle de compra por ID
  public eliminarDetalle(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/detalles-compras/${id}`, { responseType: 'text' });
  }
}
