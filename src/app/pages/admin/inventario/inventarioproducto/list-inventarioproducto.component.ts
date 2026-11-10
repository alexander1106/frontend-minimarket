import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { InventarioProductoService } from '../../../../service/inventarioproducto.services';
import { ProductosService } from '../../../../service/productos.service';
import { InventarioService } from '../../../../service/inventario.service';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { UnidadProductoService, UnidadInfo } from '../../../../service/unidad-producto.service';

interface InventarioProductoDTO {
  idinventarioproducto: number;
  stockactual: number;
  fechaingreso: string;
  idproducto: number;
  idinventario: number;
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

@Component({
  selector: 'app-list-inventarioproducto',
  standalone: true,
  imports: [PaginacionComponent, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-inventarioproducto.component.html',
  styleUrls: ['./list-inventarioproducto.component.css']
})
export class ListInventarioProductoComponent implements OnInit {
  lista: InventarioProductoView[] = [];
  filtrados: InventarioProductoView[] = [];
  productos: Producto[] = [];
  inventarios: Inventario[] = [];
  isEditMode = false;

  filtro = '';
  inventarioFiltro: number = 0;
  mostrarModal = false;
  cargando = true;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};
  modelo: InventarioProductoDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  constructor(
    private ipSvc: InventarioProductoService,
    private prodSvc: ProductosService,
    private invSvc: InventarioService,
    private unidadesSvc: UnidadProductoService
  ) {}

  unidades = new Map<number, UnidadInfo>();

  unidadCodigo(idproducto: number): string {
    return this.unidades.get(idproducto)?.codigo || '';
  }

  pasoStock(idproducto: number): string {
    return this.unidades.get(idproducto)?.permiteDecimales ? '0.001' : '1';
  }

  ngOnInit(): void {
    this.cargando = true;
    this.unidadesSvc.mapa().subscribe(m => (this.unidades = m));
    forkJoin({
      items: this.ipSvc.listarInventarioproducto(),
      prods: this.prodSvc.listarProductos(),
      invs: this.invSvc.listarInventario()
    })
    .subscribe({
      next: ({ items, prods, invs }: {
        items: InventarioProductoDTO[];
        prods: Producto[];
        invs: Inventario[];
      }) => {
        this.productos = prods;
        this.inventarios = invs;
        this.lista = items.map((item: InventarioProductoDTO) => ({
          ...item,
          productoNombre:
            prods.find((p: Producto) => p.idproducto === item.idproducto)?.nombre
            || '',
          inventarioNombre:
            invs.find((i: Inventario) => i.idinventario === item.idinventario)?.nombre
            || ''
        }));
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
    });
  }

  resetModelo(): InventarioProductoDTO {
    return {
      idinventarioproducto: 0,
      stockactual: 0,
      fechaingreso: '',
      idproducto: 0,
      idinventario: 0
    };
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let arr = this.lista;
    if (term) {
      arr = arr.filter(x =>
        x.productoNombre.toLowerCase().includes(term) ||
        x.inventarioNombre.toLowerCase().includes(term)
      );
    }

    if (this.inventarioFiltro !== 0) {
      arr = arr.filter(x => x.idinventario === this.inventarioFiltro);
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

  get sinStock(): number {
    return this.lista.filter(i => !(i.stockactual > 0)).length;
  }

  abrirModal(item?: InventarioProductoView): void {
    this.errores = {};
    this.aviso = '';
    if (item) {
      this.isEditMode = true;
      this.modelo = {
        idinventarioproducto: item.idinventarioproducto,
        stockactual: item.stockactual,
        fechaingreso: item.fechaingreso,
        idproducto: item.idproducto,
        idinventario: item.idinventario
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
    if (this.modelo.idinventarioproducto > 0 && this.modelo.stockactual > 0) {
      this.aviso = 'No se puede editar este registro porque ya tiene stock. Usa Ajustes de inventario.';
      return;
    }
    if (!this.modelo.idproducto) this.errores['idproducto'] = 'Selecciona un producto.';
    if (!this.modelo.idinventario) this.errores['idinventario'] = 'Selecciona un inventario.';
    const stock = Number(this.modelo.stockactual || 0);
    if (stock < 0) this.errores['stockactual'] = 'El stock no puede ser negativo.';
    else if (this.modelo.idproducto && this.pasoStock(this.modelo.idproducto) === '1' && !Number.isInteger(stock)) {
      this.errores['stockactual'] = 'Esta unidad solo admite cantidades enteras.';
    }
    if (Object.keys(this.errores).length) return;

    const edita = this.modelo.idinventarioproducto > 0;
    this.guardando = true;
    const pet$ = edita ? this.ipSvc.editar({ ...this.modelo, stockactual: stock }) : this.ipSvc.registrar({ ...this.modelo, stockactual: stock });
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', edita ? 'Registro actualizado' : 'Registro creado', 'success');
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

  eliminar(id: number, stock: number): void {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;

      if (stock > 0) {
        Swal.fire('Atención', 'No se puede eliminar un registro con stock', 'warning');
        return;
      }

      this.ipSvc.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Registro eliminado', 'success');
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
