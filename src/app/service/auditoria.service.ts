import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface RegistroAuditoria {
  id: number;
  fecha: string;
  username: string;
  rol: string;
  idEmpresa: number | null;
  empresa: string | null;
  accion: string;
  modulo: string;
  recurso: string;
  idRegistro: string | number | null;
  descripcion: string;
  exito: boolean;
  estadoHttp: number | null;
}

export interface DetalleAuditoria extends RegistroAuditoria {
  idUsuario: number | null;
  metodo: string;
  ruta: string;
  ip: string;
  userAgent: string;
  duracionMs: number | null;
  detalle: string | null;
}

export interface PaginaAuditoria {
  items: RegistroAuditoria[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface ResumenAuditoria {
  total: number;
  fallidos: number;
  porAccion: Record<string, number>;
  porModulo: Record<string, number>;
  topUsuarios: Record<string, number>;
}

export interface FiltrosAuditoria {
  acciones: string[];
  modulos: string[];
  usuarios: string[];
}

export interface ConsultaAuditoria {
  desde?: string;
  hasta?: string;
  username?: string;
  idEmpresa?: number | null;
  accion?: string;
  modulo?: string;
  exito?: boolean | null;
  q?: string;
  pagina?: number;
  tamano?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private api = `${baseUrl}/auditoria`;

  constructor(private http: HttpClient) {}

  private params(c: ConsultaAuditoria): HttpParams {
    let p = new HttpParams();
    (Object.keys(c) as (keyof ConsultaAuditoria)[]).forEach(k => {
      const v = c[k];
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return p;
  }

  listar(c: ConsultaAuditoria): Observable<PaginaAuditoria> {
    return this.http.get<PaginaAuditoria>(this.api, { params: this.params(c) });
  }

  resumen(desde?: string, hasta?: string): Observable<ResumenAuditoria> {
    return this.http.get<ResumenAuditoria>(`${this.api}/resumen`, { params: this.params({ desde, hasta }) });
  }

  filtros(): Observable<FiltrosAuditoria> {
    return this.http.get<FiltrosAuditoria>(`${this.api}/filtros`);
  }

  detalle(id: number): Observable<DetalleAuditoria> {
    return this.http.get<DetalleAuditoria>(`${this.api}/${id}`);
  }
}

export const ETIQUETAS_ACCION: Record<string, string> = {
  CREAR: 'Crear',
  EDITAR: 'Editar',
  ELIMINAR: 'Eliminar',
  INICIO_SESION: 'Inicio de sesión',
  INICIO_SESION_FALLIDO: 'Sesión fallida',
  OTRO: 'Otro'
};
