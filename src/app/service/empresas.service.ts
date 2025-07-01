<<<<<<< HEAD
// src/app/services/empresas.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private apiPath = `${baseUrl}/empresas`;

  constructor(private http: HttpClient) {}

  listarEmpresas(): Observable<any> {
    return this.http.get(`${baseUrl}/empresas`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/empresas/${id}`);
  }

  registrar(empresa: any): Observable<any> {
    return this.http.post(`${baseUrl}/empresas`, empresa);
  }


  editar(empresa: any): Observable<any> {
    return this.http.put(`${baseUrl}/empresas`, empresa);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/empresas/${id}`, { responseType: 'text' });
  }


}
=======
// src/app/services/empresas.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private apiPath = `${baseUrl}/empresas`;

  constructor(private http: HttpClient) {}

  listarEmpresas(): Observable<any> {
    return this.http.get(`${baseUrl}/empresas`);
  }

  buscar(id: number): Observable<any> {
    return this.http.get(`${baseUrl}/empresas/${id}`);
  }

  registrar(empresa: any): Observable<any> {
    return this.http.post(`${baseUrl}/empresas`, empresa);
  }

  editar(empresa: any): Observable<any> {
    return this.http.put(`${baseUrl}/empresas`, empresa);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${baseUrl}/empresas/${id}`, { responseType: 'text' });
  }


}
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c
