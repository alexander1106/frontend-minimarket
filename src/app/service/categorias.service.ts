import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import baseUrl from '../components/link';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private http: HttpClient) { }

  // Listar todas las categorías
  public listarCategorias(): Observable<any> {
    return this.http.get(`${baseUrl}/categorias`);
  }

  // Buscar una categoría por ID
  public buscarCategoriaId(id: any) {
    return this.http.get(`${baseUrl}/categorias/${id}`);
  }

  // Registrar una categoría con imagen (POST con FormData)
  public registrarCategorias(formData: FormData) {
    return this.http.post(`${baseUrl}/categorias/imagen`, formData);
  }

  // Editar una categoría con imagen (PUT con FormData)
  public editarcategoria(formData: FormData) {
    return this.http.put(`${baseUrl}/categorias/imagen`, formData);
    // Si tu endpoint es /categorias/con-imagen, cambia la URL:
    // return this.http.put(`${baseUrl}/categorias/con-imagen`, formData);
  }

  // Eliminar una categoría por ID
  public eliminarcategoria(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/categorias/${id}`, { responseType: 'text' });
  }
}
