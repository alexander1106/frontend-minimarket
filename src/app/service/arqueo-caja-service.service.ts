import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ArqueoCajaServiceService {
  constructor(private http: HttpClient) {}

  // Listar todos los arqueos
  public listarArqueos(): Observable<any> {
    return this.http.get(`${baseUrl}/arqueos-cajas`);
  }

  // Buscar un arqueo por ID
  public buscarArqueoPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/arqueos-cajas/${id}`);
  }

  // Registrar un nuevo arqueo
  public registrarArqueo(arqueo: any): Observable<any> {
    return this.http.post(`${baseUrl}/arqueos-cajas`, arqueo);
  }

  // Editar un arqueo existente
  public editarArqueo(arqueo: any): Observable<any> {
    return this.http.put(`${baseUrl}/arqueos-cajas`, arqueo);
  }

  // Eliminar un arqueo por ID
  public eliminarArqueo(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/arqueos-cajas/${id}`, { responseType: 'text' });
  }
}
