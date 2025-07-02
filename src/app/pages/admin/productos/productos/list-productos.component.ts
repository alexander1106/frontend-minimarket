// list-productos.component.ts
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { ProductosService } from '../../../../service/productos.service';
import { CategoriasService } from '../../../../service/categorias.service';
import { UnidadMedidaService } from '../../../../service/unidad-medida.service';
import { TipoProductoService } from '../../../../service/tipo-producto.service';

@Component({
  selector: 'app-list-productos',
  standalone: true,
  imports: [
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
  producto: any = this.resetProducto();
  selectedFile?: File;

  categorias: any[] = [];
  unidades: any[] = [];
  tipos: any[] = [];
  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private prodSvc: ProductosService,
    private catSvc: CategoriasService,
    private uniSvc: UnidadMedidaService,
    private tpSvc: TipoProductoService
  ) {}

  ngOnInit(): void {
  forkJoin({
    prods: this.prodSvc.listarProductos(),
    cats:  this.catSvc.listarCategorias(),
    units: this.uniSvc.listarUnidadesMedida(),
    types: this.tpSvc.listarTipos()
  }).subscribe({
    next: ({ prods, cats, units, types }) => {

      // guardamos los listados en las propiedades
      this.categorias = cats;
      this.unidades   = units;
      this.tipos      = types;

      // enriquecemos cada producto
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
        p.nombre.trim().toLowerCase().includes(term)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = lista.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    const count = this.filtro
      ? this.productos.filter(p =>
          p.nombre.trim().toLowerCase().includes(this.filtro.trim().toLowerCase())
        ).length
      : this.productos.length;
    return Math.ceil(count / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  abrirModal(p?: any): void {
    this.producto = p ? { ...p } : this.resetProducto();
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
  // --- 1) Validaciones básicas ---
  if (!this.producto.nombre.trim()) {
    Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    return;
  }
  if (
    this.producto.categoria.idcategoria === 0 ||
    this.producto.unidadMedida.idunidadmedida === 0 ||
    this.producto.tipoProducto.idtipoproducto === 0
  ) {
    Swal.fire('Atención', 'Seleccione categoría, unidad y tipo', 'warning');
    return;
  }
  if (this.producto.costoVenta <= 0) {
    Swal.fire('Atención', 'El precio de venta debe ser mayor a cero', 'warning');
    return;
  }

  const payload = {
    idproducto:       this.producto.idproducto || undefined,
    nombre:           this.producto.nombre,
    descripcion:      this.producto.descripcion,
    fechaVencimiento: this.producto.fechaVencimiento,
    tipoImpuesto:     this.producto.tipoImpuesto,
    costoCompra:      this.producto.costoCompra,
    costoVenta:       this.producto.costoVenta,
    costoMayor:       this.producto.costoMayor,
    imagen:           this.producto.imagen,
    idcategoria:      this.producto.categoria.idcategoria,
    idunidadmedida:   this.producto.unidadMedida.idunidadmedida,
    idtipoproducto:   this.producto.tipoProducto.idtipoproducto,
    inventarioProducto: []
  };

  const pet$ = this.producto.idproducto
    ? this.prodSvc.editar(payload)
    : this.prodSvc.registrar(payload);

  pet$.subscribe({
    next: () => {
      Swal.fire(
        'Éxito',
        this.producto.idproducto ? 'Producto actualizado' : 'Producto creado',
        'success'
      );
      this.cerrarModal();
      this.ngOnInit();
    },
    error: (err: any) => {
      const msg  = err.error?.message ?? 'Error inesperado';
      const icon = err.status === 400 ? 'warning' : 'error';
      Swal.fire(icon === 'warning' ? 'Atención' : 'Error', msg, icon);
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
