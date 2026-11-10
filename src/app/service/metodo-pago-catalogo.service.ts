import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

/** Tipos válidos que acepta el backend para un método del catálogo. */
export const TIPOS_METODO_PAGO = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'DIGITAL', etiqueta: 'Billetera digital' },
  { valor: 'TARJETA', etiqueta: 'Tarjeta' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
  { valor: 'OTRO', etiqueta: 'Otro' }
];

export interface MetodoPagoCatalogo {
  idCatalogo: number;
  nombre: string;
  tipo: string;
  requiereDetalle: boolean;
  estado?: number;
}

@Injectable({ providedIn: 'root' })
export class MetodoPagoCatalogoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<MetodoPagoCatalogo[]> {
    return this.http.get<MetodoPagoCatalogo[]>(`${baseUrl}/metodos-pago-catalogo`);
  }

  registrar(m: Partial<MetodoPagoCatalogo>): Observable<MetodoPagoCatalogo> {
    return this.http.post<MetodoPagoCatalogo>(`${baseUrl}/metodos-pago-catalogo`, m);
  }

  editar(m: Partial<MetodoPagoCatalogo>): Observable<MetodoPagoCatalogo> {
    return this.http.put<MetodoPagoCatalogo>(`${baseUrl}/metodos-pago-catalogo`, m);
  }

  /** 409 si alguna sucursal ya usa el método. */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/metodos-pago-catalogo/${id}`);
  }
}
