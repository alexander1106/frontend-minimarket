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

}
