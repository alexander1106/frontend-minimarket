import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

export interface TurnoAbierto {
  idAperturaCaja: number;
  idCaja: number;
  nombreCaja: string;
  idUsuario: number;
  cajero: string;
  fechaApertura: string;
  saldoInicial: number;
  saldoEfectivo: number;
  esMia: boolean;
}

export interface VendedorTurno {
  vendedor: string;
  ventas: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class AperturaCajaService {
obtenerTransaccionesPorApertura(idApertura: number) {
  return this.http.get<any[]>(`${baseUrl}/aperturas-cajas/${idApertura}/transacciones`);
}

  constructor(private http: HttpClient) { }

  public listarAperturas(): Observable<any> {
    return this.http.get(`${baseUrl}/aperturas-cajas`);
  }

  public turnosAbiertosPorSucursal(idSucursal: number): Observable<TurnoAbierto[]> {
    return this.http.get<TurnoAbierto[]>(`${baseUrl}/aperturas-cajas/sucursal/${idSucursal}/abiertas`);
  }

  public miTurnoAbierto(idUsuario: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/aperturas-cajas/usuario/${idUsuario}/abierta`);
  }

  public vendedoresDelTurno(idApertura: number): Observable<VendedorTurno[]> {
    return this.http.get<VendedorTurno[]>(`${baseUrl}/aperturas-cajas/${idApertura}/vendedores`);
  }

  public buscarAperturaId(id:any){
    return this.http.get(`${baseUrl}/aperturas-cajas/${id}`);
  }

 public listarAperturasPorSucursal(id: any) {
  return this.http.get<any[]>(`${baseUrl}/aperturas-cajas/sucursal/${id}`);
}
  public registrarApertura(apertura: any) {
    return this.http.post(`${baseUrl}/aperturas-cajas`, apertura );
  }

public cerrarCaja(id: any) {
  return this.http.post(`${baseUrl}/aperturas-cajas/${id}/cerrar`, {});
}

  public eliminarApertura(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/aperturas-cajas/${id}`,{ responseType: 'text' });
  }
  public editarApertura(apertura: any){
    return this.http.put(`${baseUrl}/aperturas-cajas`, apertura);
  }

    public obtenerCajaPorApertura(id: any){
    return this.http.get(`${baseUrl}/aperturas-cajas/${id}/caja`);
  }

}
