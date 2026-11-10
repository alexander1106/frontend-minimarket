import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { LoginService } from '../../../../service/login.service';
import { ProductosService, StockBajoItem } from '../../../../service/productos.service';
import { CategoriasService } from '../../../../service/categorias.service';
import { UnidadMedidaService } from '../../../../service/unidad-medida.service';
import { TipoProductoService } from '../../../../service/tipo-producto.service';
import { PresentacionesComponent } from '../../../../components/presentaciones/presentaciones.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';

@Component({
  selector: 'app-list-productos',
  standalone: true,
  imports: [PaginacionComponent, PresentacionesComponent, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-productos.component.html',
  styleUrls: ['./list-productos.component.css']
})
export class ListProductosComponent implements OnInit {
  productos: any[] = [];
  filtrados: any[] = [];
  filtro = '';
  mostrarModal = false;
  presProducto: any = null;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};
  soloStockBajo = false;
  private stockBajoMap = new Map<number, StockBajoItem>();
  puedeEscribirProductos = false;
  producto: any = this.resetProducto();
  selectedFile?: File;

  categorias: any[] = [];
  unidades: any[] = [];
  tipos: any[] = [];
  paginaActual = 1;
  elementosPorPagina = 5;
  totalFiltrado = 0;

  constructor(
    private prodSvc: ProductosService,
    private catSvc: CategoriasService,
    private uniSvc: UnidadMedidaService,
    private tpSvc: TipoProductoService,
    private loginService: LoginService,
    private router: Router
  ) {}

  private cargarStockBajo(): void {
    const idSucursal = this.loginService.getUser()?.sucursal?.idSucursal;
    if (!idSucursal) return;
    this.prodSvc.stockBajo(idSucursal).subscribe({
      next: lista => {
        this.stockBajoMap = new Map((Array.isArray(lista) ? lista : []).map(i => [i.idproducto, i]));
        this.aplicarFiltro();
      },
      error: () => (this.stockBajoMap = new Map())
    });
  }

  stockBajoDe(p: any): StockBajoItem | undefined {
    return this.stockBajoMap.get(p.idproducto);
  }

  get totalStockBajo(): number {
    return this.stockBajoMap.size;
  }

  get unidadElegida(): any {
    return this.unidades.find(u => u.idunidadmedida === this.producto?.unidadMedida?.idunidadmedida);
  }

  verKardex(p: any): void {
    this.router.navigate(['/admin/kardex'], { queryParams: { idProducto: p.idproducto } });
  }

  abrirPresentaciones(p: any): void {
    this.presProducto = p;
  }

  ngOnInit(): void {
    this.puedeEscribirProductos = this.loginService.puedeEscribirModulo('Productos', ['ADMIN', 'ALMACENERO', 'EMPRESA']);
    this.cargarStockBajo();
  forkJoin({
    prods: this.prodSvc.listarProductos(),
    cats:  this.catSvc.listarCategorias(),
    units: this.uniSvc.listarUnidadesMedida(),
    types: this.tpSvc.listarTipos()
  }).subscribe({
    next: ({ prods, cats, units, types }) => {

      this.categorias = cats;
      this.unidades   = units;
      this.tipos      = types;

      this.productos = prods.map((p: any) => ({
        ...p,
        categoria:    cats .find((c: any) => c.idcategoria     === p.idcategoria)     || null,
        unidadMedida: units.find((u: any) => u.idunidadmedida === p.idunidadmedida) || null,
        tipoProducto: types.find((t: any) => t.idtipoproducto  === p.idtipoproducto)  || null
      }));

      this.aplicarFiltro();
    },
    error: (err: any) => {
      console.error('Error cargando datos:', err);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  });
}

  resetProducto(): any {
    return {
      idproducto: 0,
      nombre: '',
      descripcion: '',
      fechaVencimiento: '',
      tipoImpuesto: '',
      costoCompra: 0,
      costoVenta: 0,
      costoMayor: 0,
      imagen: '',
      codigo: '',
      codigoBarras: '',
      marca: '',
      stockMinimo: 0,
      afectoIgv: true,
      estado: 1,
      categoria: { idcategoria: 0 },
      unidadMedida: { idunidadmedida: 0 },
      tipoProducto: { idtipoproducto: 0 }
    };
  }

  aplicarFiltro(): void {
    const term = this.filtro.trim().toLowerCase();
    let lista = this.productos;
    if (term) {
      lista = lista.filter(p =>
        (p.nombre || '').trim().toLowerCase().includes(term) ||
        (p.codigo || '').toLowerCase().includes(term) ||
        (p.codigoBarras || '').toLowerCase().includes(term) ||
        (p.marca || '').toLowerCase().includes(term)
      );
    }
    if (this.soloStockBajo) {
      lista = lista.filter(p => this.stockBajoMap.has(p.idproducto));
    }
    this.totalFiltrado = lista.length;
    if (this.paginaActual > 1 && (this.paginaActual - 1) * this.elementosPorPagina >= lista.length) this.paginaActual = 1;
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = lista.slice(start, start + this.elementosPorPagina);
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
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  abrirModal(p?: any): void {
    this.errores = {};
    this.aviso = '';
    this.producto = p
      ? {
          ...this.resetProducto(),
          ...p,
          categoria: { idcategoria: p.categoria?.idcategoria ?? p.idcategoria ?? 0 },
          unidadMedida: { idunidadmedida: p.unidadMedida?.idunidadmedida ?? p.idunidadmedida ?? 0 },
          tipoProducto: { idtipoproducto: p.tipoProducto?.idtipoproducto ?? p.idtipoproducto ?? 0 },
          codigo: p.codigo ?? '',
          codigoBarras: p.codigoBarras ?? '',
          marca: p.marca ?? '',
          stockMinimo: p.stockMinimo ?? 0,
          afectoIgv: p.afectoIgv ?? true
        }
      : this.resetProducto();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.selectedFile = undefined;
  }

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const reader = new FileReader();
  reader.onload = () => this.producto.imagen = reader.result as string;
  reader.readAsDataURL(input.files[0]);
}

  formSubmit(): void {
    this.errores = {};
    this.aviso = '';
    const pr = this.producto;
    const e = this.errores;
    if (!(pr.nombre || '').trim()) e['nombre'] = 'El nombre es obligatorio.';
    if (!pr.categoria?.idcategoria) e['idcategoria'] = 'Selecciona una categoría.';
    if (!pr.tipoProducto?.idtipoproducto) e['idtipoproducto'] = 'Selecciona un tipo de producto.';
    if (!pr.unidadMedida?.idunidadmedida) e['idunidadmedida'] = 'Selecciona la unidad base.';
    if (!(Number(pr.costoVenta) > 0)) e['costoVenta'] = 'El precio de venta debe ser mayor a cero.';
    if (pr.stockMinimo != null && pr.stockMinimo !== '' && Number(pr.stockMinimo) < 0) e['stockMinimo'] = 'El stock mínimo no puede ser negativo.';
    if (Object.keys(e).length) {
      this.aviso = 'Revisa los campos marcados.';
      return;
    }

    const vacio = (v: any) => (v == null || String(v).trim() === '' ? null : String(v).trim());
    const payload: any = {
      idproducto:       pr.idproducto || undefined,
      nombre:           pr.nombre.trim(),
      descripcion:      pr.descripcion,
      fechaVencimiento: pr.fechaVencimiento || null,
      tipoImpuesto:     pr.tipoImpuesto,
      codigo:           vacio(pr.codigo),
      codigoBarras:     vacio(pr.codigoBarras),
      marca:            vacio(pr.marca),
      stockMinimo:      pr.stockMinimo === '' || pr.stockMinimo == null ? 0 : Number(pr.stockMinimo),
      afectoIgv:        !!pr.afectoIgv,
      costoCompra:      pr.costoCompra,
      costoVenta:       pr.costoVenta,
      costoMayor:       pr.costoMayor,
      imagen:           pr.imagen,
      idcategoria:      pr.categoria.idcategoria,
      idunidadmedida:   pr.unidadMedida.idunidadmedida,
      idtipoproducto:   pr.tipoProducto.idtipoproducto
    };
    if (!pr.idproducto) payload.inventarioProducto = [];

    this.guardando = true;
    const edita = !!pr.idproducto;
    const pet$ = edita ? this.prodSvc.editar(payload) : this.prodSvc.registrar(payload);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', edita ? 'Producto actualizado' : 'Producto creado', 'success');
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        const msg: string = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'Error inesperado';
        const campos = cuerpo?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
          this.aviso = msg;
        } else if (err.status === 409) {
          if (/barras/i.test(msg)) this.errores['codigoBarras'] = msg;
          else if (/c[oó]digo|sku/i.test(msg)) this.errores['codigo'] = msg;
          else this.aviso = msg;
        } else {
          this.aviso = msg;
        }
      }
    });
  }

  borrar(id: number): void {
    Swal.fire({
      title: '¿Eliminar?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.prodSvc.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Producto eliminado', 'success');
          this.ngOnInit();
        },
        error: (err: any) =>
          Swal.fire('Error', err.error?.message ?? 'No se pudo eliminar', 'error')
      });
    });
  }
}
