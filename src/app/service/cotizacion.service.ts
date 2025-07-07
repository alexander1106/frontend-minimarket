import { Observable } from "rxjs";
import baseUrl from "../components/link";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

 constructor(private http: HttpClient) { }

 public guardarCotizacion(dto: any): Observable<any> {
    return this.http.post(`${baseUrl}/cotizaciones`, dto);
 }

 public listarCotizaciones(): Observable<any> {
    return this.http.get(`${baseUrl}/cotizaciones`);
 }

 public listarCotizacionesPorSucursal(idSucursal: number): Observable<any> {
    return this.http.get(`${baseUrl}/cotizaciones/sucursal/${idSucursal}`);
 }

 public buscarCotizacionesId(id:any){
    return this.http.get(`${baseUrl}/cotizaciones/${id}`);
 }

 public eliminarCotizaciones(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/cotizaciones/${id}`, { responseType: 'text' });
 }

 public editarCotizacione(cliente: any){
    return this.http.put(`${baseUrl}/cotizaciones`, cliente);
 }
 public obtenerDetallesPorCotizacion(idCotizacion: number): Observable<any> {
  return this.http.get(`${baseUrl}/detalles-cotizaciones/${idCotizacion}`);
}
}
