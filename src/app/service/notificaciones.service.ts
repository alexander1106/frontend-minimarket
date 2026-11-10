import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import baseUrl from '../components/link';

export interface Notificacion {
  idNotificacion: number;
  tipo: 'STOCK_BAJO' | 'POR_VENCER' | 'VENCIDO' | 'SUSCRIPCION' | 'SISTEMA';
  severidad: 'INFO' | 'ADVERTENCIA' | 'CRITICA';
  titulo: string;
  mensaje: string;
  ruta: string | null;
  leida: boolean;
  fecha: string;
  fechaLectura: string | null;
}

export interface PaginaNotificaciones {
  items: Notificacion[];
  total: number;
  pagina: number;
  totalPaginas: number;
  noLeidas: number;
}

const RUTAS: Record<string, string> = {
  '/admin/lotes': '/admin/inventarioproducto'
};

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private api = `${baseUrl}/notificaciones`;
  private contador$ = new BehaviorSubject<number>(0);
  readonly noLeidas$ = this.contador$.asObservable();

  constructor(private http: HttpClient) {}

  rutaDestino(ruta: string | null): string | null {
    if (!ruta) return null;
    return RUTAS[ruta] || ruta;
  }

  refrescarContador(): void {
    this.http.get<{ noLeidas: number }>(`${this.api}/contador`).subscribe({
      next: r => this.contador$.next(r?.noLeidas || 0),
      error: () => {}
    });
  }

  fijarContador(n: number): void {
    this.contador$.next(Math.max(0, n));
  }

  listar(opts: { soloNoLeidas?: boolean; tipo?: string; pagina?: number; tamano?: number } = {}): Observable<PaginaNotificaciones> {
    let params = new HttpParams().set('tamano', String(opts.tamano ?? 20)).set('pagina', String(opts.pagina ?? 0));
    if (opts.soloNoLeidas != null) params = params.set('soloNoLeidas', String(opts.soloNoLeidas));
    if (opts.tipo) params = params.set('tipo', opts.tipo);
    return this.http.get<PaginaNotificaciones>(this.api, { params }).pipe(tap(r => this.fijarContador(r?.noLeidas || 0)));
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.api}/${id}/leida`, {}).pipe(tap(() => this.refrescarContador()));
  }

  marcarNoLeida(id: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.api}/${id}/no-leida`, {}).pipe(tap(() => this.refrescarContador()));
  }

  marcarTodas(): Observable<{ marcadas: number }> {
    return this.http.put<{ marcadas: number }>(`${this.api}/marcar-todas`, {}).pipe(tap(() => this.contador$.next(0)));
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`).pipe(tap(() => this.refrescarContador()));
  }

  eliminarLeidas(): Observable<{ eliminadas: number }> {
    return this.http.delete<{ eliminadas: number }>(`${this.api}/leidas`).pipe(tap(() => this.refrescarContador()));
  }
}

export function tiempoRelativo(fecha: string): string {
  const t = new Date(fecha).getTime();
  if (isNaN(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
  return new Date(fecha).toLocaleDateString('es-PE');
}

export const ICONOS_NOTIFICACION: Record<string, string> = {
  STOCK_BAJO: 'fa-box-open',
  POR_VENCER: 'fa-hourglass-half',
  VENCIDO: 'fa-triangle-exclamation',
  SUSCRIPCION: 'fa-id-card',
  SISTEMA: 'fa-circle-info'
};

export const ETIQUETAS_NOTIFICACION: Record<string, string> = {
  STOCK_BAJO: 'Stock bajo',
  POR_VENCER: 'Por vencer',
  VENCIDO: 'Vencido',
  SUSCRIPCION: 'Suscripción',
  SISTEMA: 'Sistema'
};
