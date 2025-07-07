import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarMetodosPago(): Observable<any> {
    return this.http.get(`${baseUrl}/metodos-pago`);
  }

  public buscarMetodoPagoId(id:any){
    return this.http.get(`${baseUrl}/metodos-pago/${id}`);
  }

  public registrarMetodoPago(metodoPago: any) {
    return this.http.post(`${baseUrl}/metodos-pago`, metodoPago );
  }


 // Eliminar un permiso por ID
  public eliminarMetodoPago(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/metodos-pago/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarMetodoPago(metodoPago: any){
    return this.http.put(`${baseUrl}/metodos-pago/`, metodoPago);
  }
}
