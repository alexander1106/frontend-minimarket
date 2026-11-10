
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl, { apisPeruToken } from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }

  public listarClientes(): Observable<any> {
    return this.http.get(`${baseUrl}/clientes`);
  }

  public buscarClienteId(id:any){
    return this.http.get(`${baseUrl}/clientes/${id}`);
  }

  public registrarCliente(cliente: any) {
    return this.http.post(`${baseUrl}/clientes`, cliente );
  }

  public eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/clientes/${id}`,{ responseType: 'text' });
  }
  public editarCliente(cliente: any){
    return this.http.put(`${baseUrl}/clientes`, cliente);
  }
    get consultaDocumentoConfigurada(): boolean {
    return !!apisPeruToken;
  }

  /** { nombres, apellidoPaterno, apellidoMaterno } desde la API libre dniruc.apisperu.com (permite CORS). */
  public consultarDni(dni: string): Observable<any> {
    return this.http.get(`https://dniruc.apisperu.com/api/v1/dni/${dni}`, { params: { token: apisPeruToken } });
  }

  /** { razonSocial, direccion, estado, condicion } desde la misma API. */
  public consultarRuc(ruc: string): Observable<any> {
    return this.http.get(`https://dniruc.apisperu.com/api/v1/ruc/${ruc}`, { params: { token: apisPeruToken } });
  }

  public consultarReniec(dni:any){
    return this.http.get(`${baseUrl}/clientes/reniec/${dni}`);
  }
  public listarClientesPorSucursal(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/clientes/sucursal/${idSucursal}`);
}

}

