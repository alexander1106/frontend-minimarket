import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface Plan {
  idPlan: number;
  nombre: string;
  precioMensual: number;
  maxUsuarios: number | null;
  maxSucursales: number | null;
  estado: number;
  totalEmpresas: number;
}

export interface PlanPayload {
  idPlan?: number;
  nombre: string;
  precioMensual: number;
  maxUsuarios: number | null;
  maxSucursales: number | null;
  estado?: number;
}

@Injectable({ providedIn: 'root' })
export class PlanesService {
  constructor(private http: HttpClient) {}

  listar(soloActivos = false): Observable<Plan[]> {
    let params = new HttpParams();
    if (soloActivos) params = params.set('soloActivos', true);
    return this.http.get<Plan[]>(`${baseUrl}/planes`, { params });
  }

  buscar(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${baseUrl}/planes/${id}`);
  }

  registrar(p: PlanPayload): Observable<Plan> {
    return this.http.post<Plan>(`${baseUrl}/planes`, p);
  }

  editar(p: PlanPayload): Observable<Plan> {
    return this.http.put<Plan>(`${baseUrl}/planes`, p);
  }

  desactivar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${baseUrl}/planes/${id}`);
  }
}
