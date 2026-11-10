import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private http: HttpClient) { }

  public listarPagos(): Observable<any> {
    return this.http.get(`${baseUrl}/pagos`);
  }

  public buscarPagoId(id:any){
    return this.http.get(`${baseUrl}/pagos/${id}`);
  }

  public registrarPago(pagos: any) {
    return this.http.post(`${baseUrl}/pagos`, pagos );
  }

  public eliminarPagos(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/pagos/${id}`,{ responseType: 'text' });
  }
  public editarPagos(pagos: any){
    return this.http.put(`${baseUrl}/pagos`, pagos);
  }

}
