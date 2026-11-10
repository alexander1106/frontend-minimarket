import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ArqueoCajaServiceService {
  constructor(private http: HttpClient) {}

  public listarArqueos(): Observable<any> {
    return this.http.get(`${baseUrl}/arqueos-cajas`);
  }

  public buscarArqueoPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/arqueos-cajas/${id}`);
  }

  public registrarArqueo(arqueo: any): Observable<any> {
    return this.http.post(`${baseUrl}/arqueos-cajas`, arqueo);
  }

  public editarArqueo(arqueo: any): Observable<any> {
    return this.http.put(`${baseUrl}/arqueos-cajas`, arqueo);
  }

  public eliminarArqueo(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/arqueos-cajas/${id}`, { responseType: 'text' });
  }
}
