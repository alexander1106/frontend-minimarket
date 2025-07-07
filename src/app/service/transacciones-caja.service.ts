import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesCajaService {

  constructor(private http: HttpClient) { }

  // Obtener todas las transacciones
  public listarTransacciones(): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas`);
  }

  // Buscar transacción por ID
  public buscarTransaccionesporId(id: any): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas/${id}`);
  }

  // Registrar una nueva transacción
  public registrarTransaccion(transacciones: any): Observable<any> {
    return this.http.post(`${baseUrl}/transacciones-cajas`, transacciones);
  }

  // Eliminar transacción por ID
  public eliminarTransacciones(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/transaccion-caja/${id}`, { responseType: 'text' });
  }

  // Editar una transacción existente
  public editarTransaccion(transaccion: any): Observable<any> {
    return this.http.put(`${baseUrl}/transaccion-cajas`, transaccion);
  }

  // 🔵 NUEVO: Listar transacciones por apertura de caja
  public listarTransaccionesPorApertura(idAperturaCaja: number): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas/apertura/${idAperturaCaja}`);
  }

}
