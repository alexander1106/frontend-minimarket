import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http: HttpClient) { }

  // Listar ventas
  public listarVentas(): Observable<any> {
    return this.http.get(`${baseUrl}/ventas`);
  }

  // Registrar venta
  registrar(ventas: any): Observable<any> {
    return this.http.post(`${baseUrl}/ventas`, ventas);
  }

  // Descargar PDF agregado recientemente 
  descargarPDF(idVenta: number): Observable<Blob> {
    return this.http.get(`${baseUrl}/ventas/${idVenta}/pdf`, {
      responseType: 'blob'
    });
  }
}
