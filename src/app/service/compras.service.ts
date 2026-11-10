import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface DetalleCompraPayload {
  idProducto: number;
  cantidad: number;
  idPresentacion?: number | null;
  precioCompra: number;
  precioVenta: number;
  lote?: string | null;
  fechaVencimiento?: string | null;
}

export interface CompraPayload {
  idProveedor: number;
  idMetodoPago: number;
  idSucursal: number;
  descripcion?: string | null;
  detalles: DetalleCompraPayload[];
}

export interface PreciosProducto {
  precioCompra?: number | null;
  precioVenta?: number | null;
}

export interface DetalleCompraEdicion {
  idDetalleCompra: number;
  cantidad: number;
  idPresentacion?: number | null;
  precioUnitario: number;
  precioCompra: number;
  precioVenta: number;
  lote?: string | null;
  fechaVencimiento?: string | null;
  estado: 1;
}

export interface DetalleCompraNuevo {
  idCompra: number;
  idProducto: number;
  cantidad: number;
  idPresentacion?: number | null;
  precioUnitario: number;
  precioCompra: number;
  precioVenta: number;
  lote?: string | null;
  fechaVencimiento?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ComprasService {
  constructor(private http: HttpClient) {}

  /** Lista de compras. Con 204 el cuerpo llega vacío: se trata como lista vacía. */
  listar(): Observable<any[] | null> {
    return this.http.get<any[] | null>(`${baseUrl}/compras`);
  }

  buscar(id: number): Observable<{ compra: any; detalles: any[] }> {
    return this.http.get<{ compra: any; detalles: any[] }>(`${baseUrl}/compras/${id}`);
  }

  registrar(c: CompraPayload): Observable<any> {
    return this.http.post(`${baseUrl}/compras`, c);
  }

  editar(id: number, c: CompraPayload): Observable<any> {
    return this.http.put(`${baseUrl}/compras`, { idCompra: id, ...c });
  }

  /** Anula la compra y devuelve el stock; 409 si ese stock ya se vendió. Responde texto. */
  anular(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/compras/${id}`, { responseType: 'text' });
  }

  /** Precios anteriores del producto (404 si nunca se compró). */
  precios(idProducto: number): Observable<PreciosProducto> {
    return this.http.get<PreciosProducto>(`${baseUrl}/compras/productos/${idProducto}/precios`);
  }

  lineasDeCompra(idCompra: number): Observable<any[] | null> {
    return this.http.get<any[] | null>(`${baseUrl}/detalles-compras/compra/${idCompra}`);
  }

  agregarLinea(d: DetalleCompraNuevo): Observable<any> {
    return this.http.post(`${baseUrl}/detalles-compras`, d);
  }

  editarLinea(d: DetalleCompraEdicion): Observable<any> {
    return this.http.put(`${baseUrl}/detalles-compras`, d);
  }

  quitarLinea(idDetalleCompra: number): Observable<string> {
    return this.http.delete(`${baseUrl}/detalles-compras/${idDetalleCompra}`, { responseType: 'text' });
  }
}

export function leerErrorCompras(err: any): { mensaje: string; errores: Record<string, string> } {
  const cuerpo = err?.error;
  if (typeof cuerpo === 'string' && cuerpo.trim()) return { mensaje: cuerpo, errores: {} };
  return {
    mensaje: cuerpo?.message || cuerpo?.error || cuerpo?.Detalle || 'No se pudo completar la operación',
    errores: cuerpo?.errors && typeof cuerpo.errors === 'object' ? cuerpo.errors : {}
  };
}
