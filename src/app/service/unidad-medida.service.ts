import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  private apiPath = `${baseUrl}/unidad_medida`;

  constructor(private http: HttpClient) { }

  public listarUnidadesMedida(): Observable<any> {
    return this.http.get(`${baseUrl}/unidad_medida`);
  }

  public buscarUnidadPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/unidad_medida/${id}`);
  }

  public registrarUnidadMedida(unidad: any): Observable<any> {
    return this.http.post(`${baseUrl}/unidad_medida`, unidad );
  }

  public eliminarUnidadMedida(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/unidad_medida/${id}`,{ responseType: 'text' });
  }

  public editarUnidadMedida(unidad: any): Observable<any> {
  return this.http.put(`${baseUrl}/unidad_medida`, unidad);
  }

}
