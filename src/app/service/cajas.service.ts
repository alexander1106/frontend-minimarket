import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})

export class CajasService {

  constructor(private http:HttpClient) { }

  public listarCaja(): Observable<any> {
    return this.http.get(`${baseUrl}/cajas`);
  }

  public buscarCaja(id:any){
    return this.http.get(`${baseUrl}/cajas/${id}`);
  }

  public registrarCaja(cliente: any) {
    return this.http.post(`${baseUrl}/cajas`, cliente );
  }
    public eliminarCaja(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/cajas/${id}`,{ responseType: 'text' });
  }
  public editarCaja(cajas: any){
    return this.http.put(`${baseUrl}/cajas`, cajas);
  }
    public obtenerSucursalPorCaja(id:any){
    return this.http.get(`${baseUrl}/cajas/${id}/sucursal`);
  }
  obtenerCajasAbiertasMismaSucursal(idCaja: number) {
  return this.http.get<any[]>(`${baseUrl}/cajas/${idCaja}/sucursal-cajas-abiertas`);
}

}
