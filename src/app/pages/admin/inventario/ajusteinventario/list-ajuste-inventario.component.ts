import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { AjusteInventarioService } from '../../../../service/ajuste-inventario.service';
import { InventarioProductoService } from '../../../../service/inventarioproducto.services';
import { ProductosService } from '../../../../service/productos.service';
import { InventarioService } from '../../../../service/inventario.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { UnidadProductoService, UnidadInfo } from '../../../../service/unidad-producto.service';

interface AjusteInventarioDTO {
  idajusteinventario: number;
  idinventarioproducto: number;
  cantidad: number;
  descripcion: string;
  fechaAjuste: string;
}

interface Producto {
  idproducto: number;
  nombre: string;
}

interface Inventario {
  idinventario: number;
  nombre: string;
}

interface InventarioProductoDTO {
  idinventarioproducto: number;
  idproducto: number;
  idinventario: number;
  stockactual?: number;
}

interface InventarioProductoView extends InventarioProductoDTO {
  productoNombre: string;
  inventarioNombre: string;
}

interface AjusteInventarioView extends AjusteInventarioDTO {
  productoInventario: string;
  productoNombre: string;
  inventarioNombre: string;
}

@Component({
  selector: 'app-list-ajuste-inventario',
  standalone: true,
  imports: [PaginacionComponent, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-ajuste-inventario.component.html',
  styleUrls: ['./list-ajuste-inventario.component.css']
})
export class ListAjusteInventarioComponent implements OnInit {
  ajustes: AjusteInventarioView[] = [];
  filtrados: AjusteInventarioView[] = [];
  invProds: InventarioProductoView[] = [];
  inventarios: Inventario[] = [];
  inventarioFiltro: number = 0;
  filtro = '';
  mostrarModal = false;
  cargando = true;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};
  modelo: AjusteInventarioDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  constructor(
    private ajusteSvc: AjusteInventarioService,
    private ipSvc: InventarioProductoService,
    private prodSvc: ProductosService,
    private invSvc: InventarioService,
    private unidadesSvc: UnidadProductoService
  ) {}

  unidades = new Map<number, UnidadInfo>();

  private unidadDeIp(idip: number): UnidadInfo | undefined {
    const ip = this.invProds.find(v => v.idinventarioproducto === idip);
    return ip ? this.unidades.get(ip.idproducto) : undefined;
  }

  codigoIp(idip: number): string {
    return this.unidadDeIp(idip)?.codigo || '';
  }

  pasoIp(idip: number): string {
    return this.unidadDeIp(idip)?.permiteDecimales ? '0.001' : '1';
  }

ngOnInit(): void {
  this.cargando = true;
  this.unidadesSvc.mapa().subscribe(m => (this.unidades = m));
  forkJoin({
    ajustes: this.ajusteSvc.listarAjustes(),
    ipList: this.ipSvc.listarInventarioproducto(),
    prods: this.prodSvc.listarProductos(),
    invs: this.invSvc.listarInventario()
  }).subscribe({
    next: ({
      ajustes,
      ipList,
      prods,
      invs
    }: {
      ajustes: AjusteInventarioDTO[];
      ipList: InventarioProductoDTO[];
      prods: Producto[];
      invs: Inventario[];
    }) => {
      this.inventarios = invs;

      this.invProds = ipList.map((ip: InventarioProductoDTO) => ({
        ...ip,
        productoNombre: prods.find((p: Producto) => p.idproducto === ip.idproducto)?.nombre || '',
        inventarioNombre: invs.find((i: Inventario) => i.idinventario === ip.idinventario)?.nombre || ''
      }));

      this.ajustes = ajustes.map((adj: AjusteInventarioDTO) => {
        const ipv = this.invProds.find((ip: InventarioProductoView) => ip.idinventarioproducto === adj.idinventarioproducto);
        const productoNombre = ipv?.productoNombre || '';
        const inventarioNombre = ipv?.inventarioNombre || '';
        return {
          ...adj,
          productoNombre,
          inventarioNombre,
          productoInventario: `${productoNombre} - ${inventarioNombre}`
        };
      }).sort((a: AjusteInventarioView, b: AjusteInventarioView) => String(b.fechaAjuste).localeCompare(String(a.fechaAjuste)));

      this.cargando = false;
      this.aplicarFiltro();
    },
    error: (err: any) => {
      this.cargando = false;
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  });
}

  resetModelo(): AjusteInventarioDTO {
    return {
      idajusteinventario: 0,
      idinventarioproducto: 0,
      cantidad: 0,
      descripcion: '',
      fechaAjuste: ''
    };
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let arr = this.ajustes;

    if (term) {
      arr = arr.filter(x =>
        x.productoInventario.toLowerCase().includes(term) ||
        x.descripcion.toLowerCase().includes(term)
      );
    }

    if (this.inventarioFiltro !== 0) {
      arr = arr.filter(x => {
        const ip = this.invProds.find(v => v.idinventarioproducto === x.idinventarioproducto);
        return ip?.idinventario === this.inventarioFiltro;
      });
    }

    this.totalFiltrado = arr.length;
    if (this.paginaActual > 1 && (this.paginaActual - 1) * this.elementosPorPagina >= arr.length) this.paginaActual = 1;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = arr.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalFiltrado / this.elementosPorPagina));
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarFilas(n: number): void {
    this.elementosPorPagina = n;
    this.paginaActual = 1;
    this.aplicarFiltro();
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  get totalEntradas(): number {
    return this.ajustes.filter(a => a.cantidad > 0).length;
  }

  get totalSalidas(): number {
    return this.ajustes.filter(a => a.cantidad < 0).length;
  }

  get ipElegido(): InventarioProductoView | undefined {
    return this.invProds.find(ip => ip.idinventarioproducto === this.modelo.idinventarioproducto);
  }

  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  abrirModal(): void {
    this.modelo = this.resetModelo();
    this.errores = {};
    this.aviso = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    this.errores = {};
    this.aviso = '';
    if (!this.modelo.idinventarioproducto) this.errores['idinventarioproducto'] = 'Selecciona un producto.';
    const cantidad = Number(this.modelo.cantidad);
    if (!cantidad) this.errores['cantidad'] = 'La cantidad no puede ser 0.';
    else if (this.modelo.idinventarioproducto && this.pasoIp(this.modelo.idinventarioproducto) === '1' && !Number.isInteger(cantidad)) {
      this.errores['cantidad'] = 'Esta unidad solo admite cantidades enteras.';
    }
    if (Object.keys(this.errores).length) return;

    this.guardando = true;
    this.ajusteSvc.registrar({ ...this.modelo, cantidad }).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', 'Ajuste registrado', 'success');
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.Detalle) || 'No se pudo registrar el ajuste';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') this.errores = { ...campos };
        else this.aviso = msg;
      }
    });
  }
}
