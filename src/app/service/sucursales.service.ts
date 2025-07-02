import { Injectable } from '@angular/core';
import baseUrl from '../components/link';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {

  constructor(private http:HttpClient) { }

  // Obtener todos los permisos
  public listarSucursales(): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales`);
  }


  public listarSucursalesPorEmpresas(id:any){
    return this.http.get(`${baseUrl}/empresas/${id}/sucursales`);
  }

  public listarCajasPorSucursal(id:any){
    return this.http.get<any[]>(`${baseUrl}/sucursales/${id}/cajas`);
  }
public listarProductosPorSucursal(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/sucursales/${idSucursal}/productos`);
}

public obtenerEmpresPorSucursal(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/sucursales/${idSucursal}/empresa`);
}


public listarUsuariosPorSUcursales(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/sucursales/${idSucursal}/usuarios`);
}
  public registrar(cliente: any) {
    return this.http.post(`${baseUrl}/sucursales`, cliente );
  }

  editar(sucursal: any): Observable<any> {
    return this.http.put(`${baseUrl}/sucursales`, sucursal);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/sucursales/${id}`, { responseType: 'text' });
  }
}
