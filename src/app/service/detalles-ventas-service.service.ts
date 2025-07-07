import { Injectable } from '@angular/core';
import baseUrl from '../components/link';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetallesVentasService {

  constructor(private http: HttpClient) {}

  // Listar todos los detalles de ventas
  public listarDetallesVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/detalles-ventas`);
  }

  // Buscar detalle de venta por ID
  public buscarDetalleVentaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/detalles-ventas/${id}`);
  }

  // Buscar detalles por ID de venta (nuevo método)
  public buscarDetallesPorIdVenta(idVenta: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/detalles-ventas/venta/${idVenta}`);
  }

  // Registrar un detalle de venta
  public registrarDetalleVenta(detalleVenta: any): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-ventas`, detalleVenta);
  }

  // Editar un detalle de venta
  public editarDetalleVenta(detalleVenta: any): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-ventas`, detalleVenta);
  }

  // Eliminar un detalle de venta por ID
  public eliminarDetalleVenta(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/detalles-ventas/${id}`, { responseType: 'text' });
  }
}
