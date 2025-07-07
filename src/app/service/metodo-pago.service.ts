import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private http: HttpClient) { }

  // Obtener todos los métodos de pago
  public listarMetodosPago(): Observable<any> {
    return this.http.get(`${baseUrl}/metodos-pago`);
  }

  // Obtener métodos de pago de una sucursal
  public listarMetodosPagoPorSucursal(idSucursal: number): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales/${idSucursal}/metodos-pago`);
  }

  // Obtener un método de pago por ID
  public buscarMetodoPagoId(id: any): Observable<any> {
    return this.http.get(`${baseUrl}/metodos-pago/${id}`);
  }


  // Registrar un método de pago en una sucursal específica
  public registrarMetodoPagoEnSucursal(idSucursal: number, metodoPago: any): Observable<any> {
    return this.http.post(`${baseUrl}/sucursales/${idSucursal}/metodos-pago`, metodoPago);
  }

  // Eliminar un método de pago
  public eliminarMetodoPago(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/metodos-pago/${id}`, { responseType: 'text' });
  }

  // Editar un permiso existente
  public editarMetodoPago(metodoPago: any){
    return this.http.put(`${baseUrl}/metodos-pago/`, metodoPago);


  // Editar un método de pago
  public editarMetodoPago(metodoPago: any): Observable<any> {
    return this.http.put(`${baseUrl}/metodos-pago`, metodoPago);

  }
}
}