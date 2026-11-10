import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export type TipoMovimiento =
  | 'COMPRA' | 'ANULACION_COMPRA' | 'VENTA' | 'ANULACION_VENTA'
  | 'DEVOLUCION' | 'AJUSTE' | 'TRASLADO_SALIDA' | 'TRASLADO_ENTRADA';

export interface MovimientoKardex {
  idMovimiento: number;
  fecha: string;
  tipo: TipoMovimiento;
  idSucursal: number;
  cantidadBase: number;
  stockResultante: number;
  referencia: string | null;
  usuario: string | null;
}

@Injectable({ providedIn: 'root' })
export class KardexService {
  constructor(private http: HttpClient) {}

  /** Lo más reciente primero. 404 si el producto no existe o es de otra empresa. */
  porProducto(idProducto: number, filtros: { idSucursal?: number | null; desde?: string; hasta?: string } = {}): Observable<MovimientoKardex[]> {
    let params = new HttpParams();
    if (filtros.idSucursal) params = params.set('idSucursal', filtros.idSucursal);
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    return this.http.get<MovimientoKardex[]>(`${baseUrl}/kardex/productos/${idProducto}`, { params });
  }
}
