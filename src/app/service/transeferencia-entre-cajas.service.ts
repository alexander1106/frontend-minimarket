import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class TranseferenciaEntreCajasService {

  constructor(private http: HttpClient) { }

  public listarTranseferenciaEntreCajas(): Observable<any> {
    return this.http.get(`${baseUrl}/transferencias-entre-cajas`);
  }

  public buscarTranseferenciaEntreCajas(id:any){
    return this.http.get(`${baseUrl}/transferencias-entre-cajas/${id}`);
  }

  public registrarTransferenciasEntreCajas(transacciones: any) {
    return this.http.post(`${baseUrl}/transferencias-entre-cajas`, transacciones );
  }

 // Eliminar un permiso por ID
  public eliminarTransferenciasEntreCajas(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/transferencias-entre-cajas/${id}`,{ responseType: 'text' });
  }
  // Editar un permiso existente
  public editarTransferenciasEntreCajas(cliente: any){
    return this.http.put(`${baseUrl}/transeferencias-entre-cajas`, cliente);
  }
}
