import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductosService } from './productos.service';
import { UnidadMedidaService } from './unidad-medida.service';

export interface UnidadInfo {
  nombre: string;
  codigo: string;
  permiteDecimales: boolean;
}

@Injectable({ providedIn: 'root' })
export class UnidadProductoService {
  constructor(private productos: ProductosService, private unidades: UnidadMedidaService) {}

  mapa(): Observable<Map<number, UnidadInfo>> {
    return forkJoin({
      prods: this.productos.listarProductos().pipe(catchError(() => of([]))),
      unis: this.unidades.listarUnidadesMedida().pipe(catchError(() => of([])))
    }).pipe(
      map(({ prods, unis }: any) => {
        const porId = new Map<number, any>((unis || []).map((u: any) => [u.idunidadmedida, u]));
        const mapa = new Map<number, UnidadInfo>();
        (prods || []).forEach((p: any) => {
          const u = porId.get(p.idunidadmedida);
          if (u) mapa.set(p.idproducto, { nombre: u.nombre, codigo: u.codigo || u.nombre, permiteDecimales: !!u.permiteDecimales });
        });
        return mapa;
      })
    );
  }
}
