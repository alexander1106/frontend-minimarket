import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesCajaService {


  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarTransacciones(): Observable<any> {
    return this.http.get(`${baseUrl}/transacciones-cajas`);
  }

  public buscarTransaccionesporId(id:any){
    return this.http.get(`${baseUrl}/transacciones-cajas/${id}`);
  }

  public registrarTransaccion(transacciones: any) {
    return this.http.post(`${baseUrl}/transacciones-cajas`, transacciones );
  }

 // Eliminar un permiso por ID
  public eliminarTransacciones(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/transacciones-cajas/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarTransaccion(cliente: any){
    return this.http.put(`${baseUrl}/transacciones-cajas`, cliente);
  }

}
