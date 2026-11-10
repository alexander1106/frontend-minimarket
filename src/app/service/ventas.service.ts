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

  registrar(ventas: any): Observable<any> {
    return this.http.post(`${baseUrl}/ventas`, ventas);
  }

  buscarVentaPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/ventas/${id}`);
  }

  buscarVentasPorSucursal(idSucursal: number): Observable<any> {
    return this.http.get(`${baseUrl}/ventas/sucursal/${idSucursal}`)}

  descargarPDF(idVenta: number): Observable<Blob> {
    return this.http.get(`${baseUrl}/ventas/${idVenta}/pdf`, {
      responseType: 'blob'
    });
  }
}
