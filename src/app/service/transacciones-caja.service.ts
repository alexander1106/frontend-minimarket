import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesCajaService {

  constructor(private http: HttpClient) { }

  public listarTransacciones(): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas`);
  }

  public buscarTransaccionesporId(id: any): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas/${id}`);
  }

  public registrarTransaccion(transacciones: any): Observable<any> {
    return this.http.post(`${baseUrl}/transacciones-cajas`, transacciones);
  }

  public eliminarTransacciones(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/transacciones-cajas/${id}`, { responseType: 'text' });
  }

  public editarTransaccion(transaccion: any): Observable<any> {
    return this.http.put(`${baseUrl}/transacciones-cajas`, transaccion);
  }

  public listarTransaccionesPorApertura(idAperturaCaja: number): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas/apertura/${idAperturaCaja}`);
  }

}
