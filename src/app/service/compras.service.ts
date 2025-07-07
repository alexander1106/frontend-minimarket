import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private http: HttpClient) { }

  listarCompras(): Observable<any> {
    return this.http.get(`${baseUrl}/compras`);
  }

  obtenerCompra(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/compras/${id}`);
  }

  obtenerCompraConDetalles(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/compras/${id}/detalles`);
  }

  crearCompra(compra: any): Observable<any> {
    return this.http.post(`${baseUrl}/compras`, compra);
  }

  actualizarCompra(compra: any): Observable<any> {
    return this.http.put(`${baseUrl}/compras`, compra);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/compras/${id}`);
  }


  // Obtener compras por proveedor
  obtenerComprasPorProveedor(idProveedor: number): Observable<any> {
    return this.http.get(`${baseUrl}/compras/proveedor/${idProveedor}`);
  }}
