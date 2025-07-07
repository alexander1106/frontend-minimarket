import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http: HttpClient) { }

  public listarVentas(): Observable<any> {
    return this.http.get(`${baseUrl}/ventas`);
  }

  // Registrar venta
  registrar(ventas: any): Observable<any> {
    return this.http.post(`${baseUrl}/ventas`, ventas);
  }

  // Buscar venta por ID
  buscarVentaPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/ventas/${id}`);
  }

  // 🔹 NUEVO: Filtrar ventas por sucursal
  buscarVentasPorSucursal(idSucursal: number): Observable<any> {
    return this.http.get(`${baseUrl}/ventas/sucursal/${idSucursal}`)}

  descargarPDF(idVenta: number): Observable<Blob> {
    return this.http.get(`${baseUrl}/ventas/${idVenta}/pdf`, {
      responseType: 'blob'
    });
  }
}
