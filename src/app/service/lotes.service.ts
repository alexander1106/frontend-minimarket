import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface Lote {
  idLote: number;
  idProducto: number;
  producto: string;
  idSucursal: number;
  codigo: string | null;
  fechaVencimiento: string | null;
  diasParaVencer: number | null;
  vencido: boolean;
  cantidadInicial: number;
  cantidadDisponible: number;
  referencia: string | null;
}

@Injectable({ providedIn: 'root' })
export class LotesService {
  constructor(private http: HttpClient) {}

  /** Los más urgentes primero; incluye los vencidos. */
  porVencer(dias: number, idSucursal?: number | null): Observable<Lote[]> {
    let params = new HttpParams().set('dias', dias);
    if (idSucursal) params = params.set('idSucursal', idSucursal);
    return this.http.get<Lote[]>(`${baseUrl}/lotes/por-vencer`, { params });
  }

  /** Lotes del producto, con y sin saldo; el que vence antes primero. 404 si es ajeno o no existe. */
  porProducto(idProducto: number, idSucursal?: number | null): Observable<Lote[]> {
    let params = new HttpParams();
    if (idSucursal) params = params.set('idSucursal', idSucursal);
    return this.http.get<Lote[]>(`${baseUrl}/lotes/productos/${idProducto}`, { params });
  }
}
