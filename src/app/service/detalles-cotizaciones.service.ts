import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class DetallesCotizacionesService {
 constructor(private http: HttpClient) { }

  public listarDetalles(): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-cotizaciones`);
  }

  public buscarDetallePorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-cotizaciones/${id}`);
  }

  public registrarDetalle(detalle: any): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-cotizaciones`, detalle);
  }

  public actualizarDetalle(detalle: any): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-cotizaciones`, detalle);
  }

  public eliminarDetalle(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/detalles-cotizaciones/${id}`, { responseType: 'text' });
  }
}
