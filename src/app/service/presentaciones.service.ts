import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface Presentacion {
  idPresentacion: number;
  idProducto: number;
  nombre: string;
  factor: number;
  precioVenta: number | null;
  precioCompra: number | null;
  codigoBarras: string | null;
  unidadBase: string;
  equivalencia: string;
}

export interface PresentacionPayload {
  idPresentacion?: number;
  nombre: string;
  factor: number;
  precioVenta?: number | null;
  precioCompra?: number | null;
  codigoBarras?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PresentacionesService {
  constructor(private http: HttpClient) {}

  listarPorProducto(idProducto: number): Observable<Presentacion[]> {
    return this.http.get<Presentacion[]>(`${baseUrl}/productos/${idProducto}/presentaciones`);
  }

  registrar(idProducto: number, p: PresentacionPayload): Observable<Presentacion> {
    return this.http.post<Presentacion>(`${baseUrl}/productos/${idProducto}/presentaciones`, p);
  }

  editar(p: PresentacionPayload): Observable<Presentacion> {
    return this.http.put<Presentacion>(`${baseUrl}/presentaciones`, p);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/presentaciones/${id}`, { responseType: 'text' });
  }
}
