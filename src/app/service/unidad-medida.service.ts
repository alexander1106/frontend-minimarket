import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface UnidadMedida {
  idunidadmedida: number;
  nombre: string;
  codigo: string | null;
  permiteDecimales: boolean;
}

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

  public eliminarUnidadMedida(id: number): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${baseUrl}/unidad_medida/${id}`);
  }

  public editarUnidadMedida(unidad: any): Observable<any> {
  return this.http.put(`${baseUrl}/unidad_medida`, unidad);
  }

}
