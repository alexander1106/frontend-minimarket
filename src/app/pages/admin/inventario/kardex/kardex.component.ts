import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import { KardexService, MovimientoKardex, TipoMovimiento } from '../../../../service/kardex.service';
import { LoginService } from '../../../../service/login.service';
import { ProductosService } from '../../../../service/productos.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { UnidadInfo, UnidadProductoService } from '../../../../service/unidad-producto.service';

const ETIQUETAS: Record<TipoMovimiento, { texto: string; clase: 'entra' | 'sale' | 'ajuste' }> = {
  COMPRA: { texto: 'Compra', clase: 'entra' },
  ANULACION_VENTA: { texto: 'Anulación de venta', clase: 'entra' },
  DEVOLUCION: { texto: 'Devolución', clase: 'entra' },
  TRASLADO_ENTRADA: { texto: 'Traslado (entrada)', clase: 'entra' },
  VENTA: { texto: 'Venta', clase: 'sale' },
  ANULACION_COMPRA: { texto: 'Anulación de compra', clase: 'sale' },
  TRASLADO_SALIDA: { texto: 'Traslado (salida)', clase: 'sale' },
  AJUSTE: { texto: 'Ajuste', clase: 'ajuste' }
};

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent, PaginarPipe],
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {
  productos: any[] = [];
  sucursales: any[] = [];
  unidades = new Map<number, UnidadInfo>();

  idProducto: number | null = null;
  idSucursal: number | null = null;
  desde = '';
  hasta = '';

  movimientos: MovimientoKardex[] = [];
  consultado = false;
  cargando = false;
  error = '';

  pagina = 1;
  porPagina = 5;

  constructor(
    private svc: KardexService,
    private productosSvc: ProductosService,
    private sucursalesSvc: SucursalesService,
    private unidadesSvc: UnidadProductoService,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.loginService.hasRole('SUPERADMIN')) {
      this.router.navigate(['/admin']);
      return;
    }

    const empresa = this.loginService.getEmpresa();
    const user = this.loginService.getUser();
    const idEmpresa = Number(empresa?.idempresa ?? empresa?.idEmpresa ?? user?.sucursal?.empresa?.idempresa) || null;
    this.idSucursal = user?.sucursal?.idSucursal ?? null;

    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    this.hasta = this.iso(hoy);
    this.desde = this.iso(hace30);

    forkJoin({
      productos: this.productosSvc.listarProductos().pipe(catchError(() => of([]))),
      sucursales: idEmpresa ? this.sucursalesSvc.listarSucursalesPorEmpresas(idEmpresa).pipe(catchError(() => of([]))) : of([]),
      unidades: this.unidadesSvc.mapa()
    }).subscribe(r => {
      this.unidades = r.unidades;
      this.productos = (Array.isArray(r.productos) ? r.productos : []).filter((p: any) => p.estado !== 0);
      this.sucursales = (Array.isArray(r.sucursales) ? r.sucursales : []).filter((s: any) => s.estado !== 0);
      if (this.idSucursal && !this.sucursales.some(s => s.idSucursal === this.idSucursal)) {
        const u = user?.sucursal;
        this.sucursales.unshift({ idSucursal: this.idSucursal, nombreSucursal: u?.nombreSucursal || u?.nombre || 'Mi sucursal' });
      }

      const q = Number(this.route.snapshot.queryParamMap.get('idProducto'));
      if (q) {
        this.idProducto = q;
        this.consultar();
      }
    });
  }

  private iso(d: Date): string {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  get unidad(): UnidadInfo | undefined {
    return this.idProducto ? this.unidades.get(this.idProducto) : undefined;
  }

  get codigoUnidad(): string {
    return this.unidad?.codigo || '';
  }

  nombreProducto(): string {
    return this.productos.find(p => p.idproducto === this.idProducto)?.nombre || '';
  }

  consultar(): void {
    this.error = '';
    if (!this.idProducto) {
      this.error = 'Elige un producto para ver su kardex.';
      return;
    }
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.error = 'La fecha "desde" no puede ser posterior a "hasta".';
      return;
    }
    this.cargando = true;
    this.pagina = 1;
    this.svc.porProducto(this.idProducto, { idSucursal: this.idSucursal, desde: this.desde, hasta: this.hasta }).subscribe({
      next: lista => {
        this.movimientos = Array.isArray(lista) ? lista : [];
        this.consultado = true;
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        this.movimientos = [];
        this.consultado = false;
        if (err.status === 404) {
          this.error = 'El producto no existe.';
        } else if (err.status !== 401 && err.status !== 403) {
          const cuerpo = err.error;
          this.error = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'No se pudo cargar el kardex.';
        }
      }
    });
  }

  limpiar(): void {
    this.idProducto = null;
    this.movimientos = [];
    this.consultado = false;
    this.error = '';
  }

  etiqueta(tipo: TipoMovimiento): { texto: string; clase: string } {
    return ETIQUETAS[tipo] || { texto: tipo, clase: 'ajuste' };
  }

  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  get totalEntradas(): number {
    return this.movimientos.filter(m => m.cantidadBase > 0).reduce((s, m) => s + Number(m.cantidadBase), 0);
  }

  get totalSalidas(): number {
    return this.movimientos.filter(m => m.cantidadBase < 0).reduce((s, m) => s + Math.abs(Number(m.cantidadBase)), 0);
  }

  get stockActual(): number | null {
    return this.movimientos.length ? Number(this.movimientos[0].stockResultante) : null;
  }

  exportar(): void {
    if (!this.movimientos.length) return;
    const filas = [['Fecha', 'Tipo', 'Cantidad', 'Stock resultante', 'Referencia', 'Usuario']].concat(
      this.movimientos.map(m => [
        m.fecha, this.etiqueta(m.tipo).texto, this.cant(m.cantidadBase), this.cant(m.stockResultante), m.referencia || '', m.usuario || ''
      ])
    );
    const csv = '﻿' + filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `kardex_${this.nombreProducto().replace(/\s+/g, '_') || 'producto'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
