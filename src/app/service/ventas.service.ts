import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http:HttpClient) { }

    // Obtener todos los permisos
  public listarVentas(): Observable<any> {
    return this.http.get(`${baseUrl}/ventas`);
  }


  registrar(ventas: any): Observable<any> {
    return this.http.post(`${baseUrl}/ventas`, ventas);
  }
}
