import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class AperturaCajaService {
  obtenerAperturaPorCaja(arg0: number) {
    throw new Error('Method not implemented.');
  }


  constructor(private http: HttpClient) { }

  // Obtener todos los permisos
  public listarAperturas(): Observable<any> {
    return this.http.get(`${baseUrl}/aperturas-cajas`);
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

 // Eliminar un permiso por ID
  public eliminarApertura(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/aperturas-cajas/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarApertura(apertura: any){
    return this.http.put(`${baseUrl}/aperturas-cajas`, apertura);
  }

    public obtenerCajaPorApertura(id: any){
    return this.http.get(`${baseUrl}/aperturas-cajas/${id}/caja`);
  }


}
