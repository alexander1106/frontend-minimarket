import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'paginar', standalone: true, pure: false })
export class PaginarPipe implements PipeTransform {
  transform<T>(lista: T[] | null | undefined, pagina: number, porPagina: number): T[] {
    if (!Array.isArray(lista)) return [];
    const inicio = (pagina - 1) * porPagina;
    return lista.slice(inicio, inicio + porPagina);
  }
}
