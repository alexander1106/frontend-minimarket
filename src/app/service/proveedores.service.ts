import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl, { apisPeruToken } from '../components/link';

export interface Proveedor {
  idProveedor: number;
  nombre: string;
  ruc: string;
  regimen: string | null;
  telefono: string | null;
  gmail: string | null;
  direccion: string | null;
  fecha_registro: string;
  estado: number;
  idEmpresa: number;
  empresaNombre: string;
}

export interface ProveedorPayload {
  idProveedor?: number;
  nombre: string;
  ruc: string;
  regimen?: string | null;
  telefono?: string | null;
  gmail?: string | null;
  direccion?: string | null;
  idEmpresa: number;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  constructor(private http: HttpClient) {}

  listarPorEmpresa(idEmpresa: number): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${baseUrl}/proveedores/empresas/${idEmpresa}`);
  }

  buscar(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${baseUrl}/proveedores/${id}`);
  }

  registrar(p: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${baseUrl}/proveedores`, p);
  }

  editar(p: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${baseUrl}/proveedores`, p);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/proveedores/${id}`, { responseType: 'text' });
  }

  get sunatConfigurado(): boolean {
    return !!apisPeruToken;
  }

  /**
   * Datos de SUNAT para un RUC (razonSocial, direccion, estado, condicion…) desde la API libre
   * dniruc.apisperu.com, que sí permite llamadas desde el navegador (CORS). No pasa por el backend.
   */
  consultarSunat(ruc: string): Observable<any> {
    return this.http.get(`https://dniruc.apisperu.com/api/v1/ruc/${ruc}`, { params: { token: apisPeruToken } });
  }
}
