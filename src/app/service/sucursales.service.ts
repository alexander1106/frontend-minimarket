<<<<<<< HEAD
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

  public buscarSucursal(id:any){
    return this.http.get(`${baseUrl}/sucursales/${id}`);
  }
public listarProductosPorSucursal(idSucursal: number): Observable<any> {
  return this.http.get(`${baseUrl}/sucursales/${idSucursal}/productos`);
}
  public registrarSucural(cliente: any) {
    return this.http.post(`${baseUrl}/sucursales`, cliente );
  }

  editar(sucursal: any): Observable<any> {
    return this.http.put(`${baseUrl}/sucursales`, sucursal);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/sucursales/${id}`, { responseType: 'text' });
  }
}
=======
// src/app/services/empresas.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private apiPath = `${baseUrl}/sucursales`;

  constructor(private http: HttpClient) {}

  listarSucursales(): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/sucursales/${id}`);
  }

  registrar(sucursal: any): Observable<any> {
    return this.http.post(`${baseUrl}/sucursales`, sucursal);
  }

  editar(sucursal: any): Observable<any> {
    return this.http.put(`${baseUrl}/sucursales`, sucursal);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/sucursales/${id}`, { responseType: 'text' });
  }
  listarTodas(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8080/api/minimarket/sucursales');
}


}
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c
