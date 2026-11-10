import { Injectable } from '@angular/core';
import baseUrl from '../components/link';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetallesVentasService {

  constructor(private http: HttpClient) {}

  public listarDetallesVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/detalles-ventas`);
  }

  public buscarDetalleVentaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/detalles-ventas/${id}`);
  }

  public buscarDetallesPorIdVenta(idVenta: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/detalles-ventas/venta/${idVenta}`);
  }

  public registrarDetalleVenta(detalleVenta: any): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-ventas`, detalleVenta);
  }

  public editarDetalleVenta(detalleVenta: any): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-ventas`, detalleVenta);
  }

  public eliminarDetalleVenta(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/detalles-ventas/${id}`, { responseType: 'text' });
  }
}
