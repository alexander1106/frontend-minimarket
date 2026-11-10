import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { TrasladoInventarioProductoService } from '../../../../service/traslado-inventario-producto.services';
import { InventarioProductoService } from '../../../../service/inventarioproducto.services';
import { ProductosService } from '../../../../service/productos.service';
import { InventarioService } from '../../../../service/inventario.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { UnidadProductoService, UnidadInfo } from '../../../../service/unidad-producto.service';

interface TrasladoDTO {
  idtraslado: number;
  origenId: number;
  destinoId: number;
  cantidad: number;
  descripcion: string;
  fechaTraslado: string;
}

interface InventarioProductoDTO {
  idinventarioproducto: number;
  idproducto: number;
  idinventario: number;
  stockactual?: number;
}

interface Producto {
  idproducto: number;
  nombre: string;
}

interface Inventario {
  idinventario: number;
  nombre: string;
}

interface InventarioProductoView extends InventarioProductoDTO {
  productoNombre: string;
  inventarioNombre: string;
}

interface TrasladoView extends TrasladoDTO {
  origenNombre: string;
  destinoNombre: string;
}

@Component({
  selector: 'app-list-traslado-inventario-producto',
  standalone: true,
  imports: [PaginacionComponent, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-traslado-inventarioproducto.component.html',
  styleUrls: ['./list-traslado-inventarioproducto.component.css']
})
export class ListTrasladoInventarioProductoComponent implements OnInit {
  traslados: TrasladoView[] = [];
  filtrados: TrasladoView[] = [];
  invProds: InventarioProductoView[] = [];
  filtro = '';
  mostrarModal = false;
  isEditMode = false;
  cargando = true;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};
  modelo: TrasladoDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  constructor(
    private traslado: TrasladoInventarioProductoService,
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

  permiteDecimalesIp(idip: number): boolean {
    return !!this.unidadDeIp(idip)?.permiteDecimales;
  }

  ngOnInit(): void {
    this.cargando = true;
    this.unidadesSvc.mapa().subscribe(m => (this.unidades = m));
    forkJoin({
      traslados: this.traslado.listarTraslados(),
      ipList: this.ipSvc.listarInventarioproducto(),
      prods: this.prodSvc.listarProductos(),
      invs: this.invSvc.listarInventario()
    }).subscribe({
      next: ({ traslados, ipList, prods, invs }: {
        traslados: TrasladoDTO[];
        ipList: InventarioProductoDTO[];
        prods: Producto[];
        invs: Inventario[];
      }) => {
        this.invProds = ipList.map(ip => ({
          ...ip,
          productoNombre: prods.find((p: Producto) => p.idproducto === ip.idproducto)?.nombre || '',
          inventarioNombre: invs.find((i: Inventario) => i.idinventario === ip.idinventario)?.nombre || ''
        }));
        const nombre = (idip: number) => {
          const ip = this.invProds.find(v => v.idinventarioproducto === idip);
          return ip ? `${ip.productoNombre} · ${ip.inventarioNombre}` : '—';
        };
        this.traslados = traslados
          .map(t => ({ ...t, origenNombre: nombre(t.origenId), destinoNombre: nombre(t.destinoId) }))
          .sort((a, b) => String(b.fechaTraslado).localeCompare(String(a.fechaTraslado)));
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    });
  }

  resetModelo(): TrasladoDTO {
    return {
      idtraslado: 0,
      origenId: 0,
      destinoId: 0,
      cantidad: 0,
      descripcion: '',
      fechaTraslado: ''
    };
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let arr = this.traslados;
    if (term) {
      arr = arr.filter(x =>
        x.origenNombre.toLowerCase().includes(term) ||
        x.destinoNombre.toLowerCase().includes(term) ||
        x.descripcion.toLowerCase().includes(term)
      );
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

  get origenElegido(): InventarioProductoView | undefined {
    return this.invProds.find(ip => ip.idinventarioproducto === this.modelo.origenId);
  }

  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  abrirModal(t?: TrasladoView): void {
    this.errores = {};
    this.aviso = '';
    if (t) {
      this.isEditMode = true;
      this.modelo = {
        idtraslado: t.idtraslado,
        origenId: t.origenId,
        destinoId: t.destinoId,
        cantidad: t.cantidad,
        descripcion: t.descripcion,
        fechaTraslado: t.fechaTraslado
      };
    } else {
      this.isEditMode = false;
      this.modelo = this.resetModelo();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
    this.errores = {};
    this.aviso = '';
    if (!this.modelo.origenId) this.errores['origenId'] = 'Selecciona el origen.';
    if (!this.modelo.destinoId) this.errores['destinoId'] = 'Selecciona el destino.';
    else if (this.modelo.origenId === this.modelo.destinoId) this.errores['destinoId'] = 'El origen y el destino no pueden ser iguales.';
    const cantidad = Number(this.modelo.cantidad);
    if (!(cantidad > 0)) this.errores['cantidad'] = 'La cantidad debe ser mayor a cero.';
    else if (this.modelo.origenId && !this.permiteDecimalesIp(this.modelo.origenId) && !Number.isInteger(cantidad)) {
      this.errores['cantidad'] = 'Esta unidad solo admite cantidades enteras.';
    }
    if (Object.keys(this.errores).length) return;

    const dto: any = {
      origenId: this.modelo.origenId,
      destinoId: this.modelo.destinoId,
      cantidad,
      descripcion: this.modelo.descripcion
    };
    if (this.isEditMode) {
      dto.idtraslado = this.modelo.idtraslado;
      if (this.modelo.fechaTraslado) dto.fechaTraslado = this.modelo.fechaTraslado;
    }

    this.guardando = true;
    const pet$ = this.isEditMode ? this.traslado.editar(dto) : this.traslado.registrar(dto);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', this.isEditMode ? 'Traslado actualizado' : 'Traslado creado', 'success');
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.Detalle) || 'Error inesperado';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') this.errores = { ...campos };
        else this.aviso = msg;
      }
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar traslado?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.traslado.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Traslado eliminado', 'success');
          this.ngOnInit();
        },
        error: (err: any) => {
          const msg = err.error?.message ?? 'No se pudo eliminar';
          Swal.fire('Atención', msg, 'warning');
        }
      });
    });
  }
}
