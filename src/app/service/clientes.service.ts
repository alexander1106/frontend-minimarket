import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {


  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarClientes(): Observable<any> {
    return this.http.get(`${baseUrl}/clientes`);
  }

  public buscarClienteId(id:any){
    return this.http.get(`${baseUrl}/clientes/${id}`);
  }

  public registrarCliente(cliente: any) {
    return this.http.post(`${baseUrl}/clientes`, cliente );
  }

 // Eliminar un permiso por ID
  public eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/clientes/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarCliente(cliente: any){
    return this.http.put(`${baseUrl}/clientes`, cliente);
  }
    public consultarReniec(dni:any){
    return this.http.get(`${baseUrl}/clientes/reniec/${dni}`);
  }
}
