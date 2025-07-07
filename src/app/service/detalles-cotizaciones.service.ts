import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class DetallesCotizacionesService {
 constructor(private http: HttpClient) { }

  // Listar todos los detalles de cotizaciones
  public listarDetalles(): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-cotizaciones`);
  }

  // Obtener un detalle por su ID
  public buscarDetallePorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/detalles-cotizaciones/${id}`);
  }

  // Registrar un nuevo detalle de cotización
  public registrarDetalle(detalle: any): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-cotizaciones`, detalle);
  }

  // Actualizar un detalle existente
  public actualizarDetalle(detalle: any): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-cotizaciones`, detalle);
  }

  // Eliminar un detalle por su ID
  public eliminarDetalle(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/detalles-cotizaciones/${id}`, { responseType: 'text' });
  }
}
