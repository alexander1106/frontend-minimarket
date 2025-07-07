import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from '../components/link';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoMetodoPagoServiceService {

  constructor(private http: HttpClient) { }

  public listarPorApertura(idAperturaCaja: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/saldo-metodo/apertura/${idAperturaCaja}`);
  }

  public obtenerPorAperturaYMetodo(idAperturaCaja: number, idMetodoPago: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/saldo-metodo/apertura/${idAperturaCaja}/metodo/${idMetodoPago}`);
  }

  public crearSaldo(saldo: any): Observable<any> {
    return this.http.post(`${baseUrl}/saldo-metodo`, saldo);
  }

  public actualizarSaldo(id: number, saldo: any): Observable<any> {
    return this.http.put(`${baseUrl}/saldo-metodo/${id}`, saldo);
  }

  public eliminarSaldo(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/saldo-metodo/${id}`, { responseType: 'text' });
  }
}
