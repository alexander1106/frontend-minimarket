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
  imports: [
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
  modelo: TrasladoDTO = this.resetModelo();

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(
    private traslado: TrasladoInventarioProductoService,
    private ipSvc: InventarioProductoService,
    private prodSvc: ProductosService,
    private invSvc: InventarioService
  ) {}

  ngOnInit(): void {
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
        // 1) Prepara la lista de Inventario×Producto con nombres
        this.invProds = ipList.map(ip => ({
          ...ip,
          productoNombre: prods.find((p: Producto) => p.idproducto === ip.idproducto)?.nombre || '',
          inventarioNombre: invs.find((i: Inventario) => i.idinventario === ip.idinventario)?.nombre || ''
        }));
        // 2) Construye la vista de traslados
        this.traslados = traslados.map(t => {
          const orig = this.invProds.find(ip => ip.idinventarioproducto === t.origenId)!;
          const dest = this.invProds.find(ip => ip.idinventarioproducto === t.destinoId)!;
          return {
            ...t,
            origenNombre: `${orig.productoNombre} – ${orig.inventarioNombre}`,
            destinoNombre: `${dest.productoNombre} – ${dest.inventarioNombre}`
          };
        });
        this.aplicarFiltro();
      },
      error: err => {
        console.error(err);
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
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = arr.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.traslados.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(t?: TrasladoView): void {
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
  // 1) Validaciones UI
  if (!this.modelo.origenId || !this.modelo.destinoId) {
    Swal.fire('Atención', 'Seleccione origen y destino', 'warning');
    return;
  }
  if (this.modelo.origenId === this.modelo.destinoId) {
    Swal.fire('Atención', 'Origen y destino no pueden ser iguales', 'warning');
    return;
  }
  if (this.modelo.cantidad <= 0) {
    Swal.fire('Atención', 'Cantidad debe ser mayor a cero', 'warning');
    return;
  }

  // 2) Construir payload sin fechaTraslado vacía
  const dto: any = {
    origenId: this.modelo.origenId,
    destinoId: this.modelo.destinoId,
    cantidad: this.modelo.cantidad,
    descripcion: this.modelo.descripcion
  };
  // Si estamos editando, incluimos el ID y solo la fecha si realmente existe
  if (this.isEditMode) {
    dto.idtraslado = this.modelo.idtraslado;
    if (this.modelo.fechaTraslado) {
      dto.fechaTraslado = this.modelo.fechaTraslado;
    }
  }

  // 3) Llamada al servicio
  const pet$ = this.isEditMode
    ? this.traslado.editar(dto)
    : this.traslado.registrar(dto);

  pet$.subscribe({
    next: () => {
      Swal.fire(
        'Éxito',
        this.isEditMode ? 'Traslado actualizado' : 'Traslado creado',
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
