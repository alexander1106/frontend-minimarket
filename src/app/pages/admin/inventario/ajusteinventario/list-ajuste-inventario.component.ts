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
}

interface InventarioProductoView extends InventarioProductoDTO {
  productoNombre: string;
  inventarioNombre: string;
}

interface AjusteInventarioView extends AjusteInventarioDTO {
  productoInventario: string;
}

@Component({
  selector: 'app-list-ajuste-inventario',
  standalone: true,
  imports: [
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
  inventarios: Inventario[] = []; // <- para llenar el combo
  inventarioFiltro: number = 0;
  filtro = '';
  mostrarModal = false;
  isEditMode = false;
  modelo: AjusteInventarioDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private ajusteSvc: AjusteInventarioService,
    private ipSvc: InventarioProductoService,
    private prodSvc: ProductosService,
    private invSvc: InventarioService
  ) {}
ngOnInit(): void {
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
        const ipv = this.invProds.find((ip: InventarioProductoView) => ip.idinventarioproducto === adj.idinventarioproducto)!;
        return {
          ...adj,
          productoInventario: `${ipv.productoNombre} - ${ipv.inventarioNombre}`
        };
      });

      this.aplicarFiltro();
    },
    error: (err: any) => {
      console.error(err);
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

    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = arr.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.ajustes.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(adj?: AjusteInventarioView): void {
    if (adj) {
      this.isEditMode = true;
      this.modelo = {
        idajusteinventario: adj.idajusteinventario,
        idinventarioproducto: adj.idinventarioproducto,
        cantidad: adj.cantidad,
        descripcion: adj.descripcion,
        fechaAjuste: adj.fechaAjuste
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
    if (this.isEditMode) {
      Swal.fire('Atención', 'No se puede editar un ajuste una vez creado', 'warning');
      return;
    }

    if (!this.modelo.idinventarioproducto) {
      Swal.fire('Atención', 'Seleccione Inventario×Producto', 'warning');
      return;
    }

    this.ajusteSvc.registrar(this.modelo).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Ajuste creado', 'success');
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

  eliminar(id: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'No se puede eliminar un ajuste una vez creado'
    });
  }
}
