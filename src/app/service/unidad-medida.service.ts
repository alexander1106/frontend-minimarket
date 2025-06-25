import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  // Ajuste: coincide con el endpoint REST "unidad_medida"
  private apiPath = `${baseUrl}/unidad_medida`;

  constructor(private http: HttpClient) { }

  // Listar todas las unidades de medida
  public listarUnidadesMedida(): Observable<any> {
    return this.http.get(`${baseUrl}/unidad_medida`);
  }

  // Obtener una unidad por ID
  public buscarUnidadPorId(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/unidad_medida/${id}`);
  }

  // Registrar nueva unidad de medida
  public registrarUnidadMedida(unidad: any): Observable<any> {
    return this.http.post(`${baseUrl}/unidad_medida`, unidad );
  }

  // Eliminar unidad de medida
  public eliminarUnidadMedida(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/unidad_medida/${id}`,{ responseType: 'text' });
  }

  // Editar unidad existente
  public editarUnidadMedida(unidad: any): Observable<any> {
    return this.http.put(`${baseUrl}/unidad_medida"/`, unidad);
  }

}
