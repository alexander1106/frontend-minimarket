import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class TrasladoInventarioProductoService {
  private apiPath = `${baseUrl}/traslados`;

  constructor(private http: HttpClient) {}

  listarTraslados(): Observable<any> {
    return this.http.get(`${baseUrl}/traslados`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/traslados/${id}`);
  }

  registrar(traslado: any): Observable<any> {
    return this.http.post(`${baseUrl}/traslados`, traslado );
  }

  editar(traslado: any): Observable<any> {
    return this.http.put(`${baseUrl}/traslados`, traslado);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/traslados/${id}`,{ responseType: 'text' });
  }
}
