import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class PagosService {


  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarPagos(): Observable<any> {
    return this.http.get(`${baseUrl}/pagos`);
  }

  public buscarPagoId(id:any){
    return this.http.get(`${baseUrl}/pagos/${id}`);
  }

  public registrarPago(cliente: any) {
    return this.http.post(`${baseUrl}/pagos`, cliente );
  }

 // Eliminar un permiso por ID
  public eliminarPagos(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/pagos/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarPagos(pagos: any){
    return this.http.put(`${baseUrl}/pagos`, pagos);
  }

}
