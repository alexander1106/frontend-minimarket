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
  imports: [
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
  inventarioFiltro: number = 0; // ← AGREGADO para el combo
  mostrarModal = false;
  modelo: InventarioProductoDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private ipSvc: InventarioProductoService,
    private prodSvc: ProductosService,
    private invSvc: InventarioService
  ) {}

  ngOnInit(): void {
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
        this.aplicarFiltro();
      },
      error: err => {
        console.error(err);
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

    // ← AGREGADO: Filtro por combo de inventario
    if (this.inventarioFiltro !== 0) {
      arr = arr.filter(x => x.idinventario === this.inventarioFiltro);
    }

    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = arr.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.lista.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(item?: InventarioProductoView): void {
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
    if (this.modelo.idinventarioproducto > 0 && this.modelo.stockactual > 0) {
      Swal.fire(
        'Atención',
        'No se puede editar este registro porque ya tiene stock.',
        'warning'
      );
      return;
    }

    if (!this.modelo.idproducto || !this.modelo.idinventario) {
      Swal.fire('Atención', 'Seleccione producto e inventario', 'warning');
      return;
    }
    if (this.modelo.stockactual < 0) {
      Swal.fire('Atención', 'El stock debe ser ≥ 0', 'warning');
      return;
    }

    const pet$ = this.modelo.idinventarioproducto > 0
      ? this.ipSvc.editar(this.modelo)
      : this.ipSvc.registrar(this.modelo);

    pet$.subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          this.modelo.idinventarioproducto > 0
            ? 'Registro actualizado'
            : 'Registro creado',
          'success'
        );
        this.cerrarModal();
        this.ngOnInit();
      },
      error: (err: any) => {
        const msg = err.error?.message ?? 'Error inesperado';
        const icon = err.status === 400 ? 'warning' : 'error';
        Swal.fire(icon === 'warning' ? 'Atención' : 'Error', msg, icon);
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
