import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarDelivery(): Observable<any> {
    return this.http.get(`${baseUrl}/delivery`);
  }
  public eliminarDelivery(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/delivery/${id}`,{ responseType: 'text' });
  }
  public actualizarDelivery(id: number, delivery: any): Observable<any> {
  return this.http.put(`${baseUrl}/delivery/${id}`, delivery);
}


}
