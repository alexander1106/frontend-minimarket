import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

 constructor(private http: HttpClient) { }
  // clientes.service.ts o puedes crear cotizaciones.service.ts
  public guardarCotizacion(dto: any): Observable<any> {
    return this.http.post(`${baseUrl}/cotizaciones`, dto);
  }

  // Obtener todos los permisos
  public listarCotizaciones(): Observable<any> {
    return this.http.get(`${baseUrl}/cotizaciones`);
  }

  public buscarCotizacionesId(id:any){
    return this.http.get(`${baseUrl}/cotizaciones/${id}`);
  }

  public eliminarCotizaciones(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/cotizaciones/${id}`,{ responseType: 'text' });
  }

  public editarCotizacione(cliente: any){
    return this.http.put(`${baseUrl}/cotizaciones`, cliente);
  }
}
