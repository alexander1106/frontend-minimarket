import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private http: HttpClient) { }

  public listarMetodosPago(): Observable<any> {
    return this.http.get(`${baseUrl}/metodos-pago`);
  }

  public listarMetodosPagoPorSucursal(idSucursal: number): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales/${idSucursal}/metodos-pago`);
  }

  public buscarMetodoPagoId(id: any): Observable<any> {
    return this.http.get(`${baseUrl}/metodos-pago/${id}`);
  }

  /** La sucursal activa un método del catálogo: { idCatalogo, detalle }. 409 si ya lo tiene; 400 si falta el dato obligatorio. */
  public activarMetodoPago(idSucursal: number, cuerpo: { idCatalogo: number | null; detalle?: string | null }): Observable<any> {
    return this.http.post(`${baseUrl}/sucursales/${idSucursal}/metodos-pago`, cuerpo);
  }

  public registrarMetodoPagoEnSucursal(idSucursal: number, metodoPago: any): Observable<any> {
    return this.http.post(`${baseUrl}/sucursales/${idSucursal}/metodos-pago`, metodoPago);
  }

  public eliminarMetodoPago(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/metodos-pago/${id}`, { responseType: 'text' });
  }

  public editarMetodoPago(metodoPago: any): Observable<any> {
    return this.http.put(`${baseUrl}/metodos-pago`, metodoPago);
  }
}
