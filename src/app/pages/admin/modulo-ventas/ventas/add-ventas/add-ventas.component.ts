import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { CategoriasService } from '../../../../../service/categorias.service';
import { ProductosService } from '../../../../../service/productos.service';
import { ClientesService } from '../../../../../service/clientes.service';
import { FormsModule } from '@angular/forms';
import { CotizacionService } from '../../../../../service/cotizacion.service';

export interface CotizacionesDTO {
  id_cliente: number;
  fechaCotizacion: string;
  estadoCotizacion: string;
  numeroCotizacion: string;
  totalCotizacion: number;
}

@Component({
  selector: 'app-add-ventas',
  standalone: true,
  imports: [
    BarraLateralComponent,
    HeaderComponent,
    CommonModule,
    RouterModule,
    FormsModule, FormsModule
  ],
  templateUrl: './add-ventas.component.html',
  styleUrls: ['./add-ventas.component.css']
})
export class AddVentasComponent implements OnInit {
  categorias: any[] = [];
  productos: any[] = [];
  productosAgregados: any[] = [];
  clientes: any[] = [];

  mostrarModalCotizacion = false;
  mostrarModalPago = false;

  clienteSeleccionado: number | null = null;
  fechaVencimiento: string = '';
  totalPagar: number = 182000;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private cotizacionService: CotizacionService
  ) {}

  ngOnInit(): void {
    this.categoriasService.listarCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.clientesService.listarClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error('Error cargando clientes', err)
    });

    this.listarProductos();
  }

  abrirModalCotizacion() {
    this.mostrarModalCotizacion = true;
  }

  abrirModalPago() {
    this.mostrarModalPago = true;
  }

  cerrarModales() {
    this.mostrarModalCotizacion = false;
    this.mostrarModalPago = false;
    this.clienteSeleccionado = null;
  }

  generarCotizacion() {
    if (!this.clienteSeleccionado) {
      Swal.fire("Advertencia", "Debe seleccionar un cliente", "warning");
      return;
    }

    const cotizacion: CotizacionesDTO = {
      id_cliente: this.clienteSeleccionado,
      fechaCotizacion: this.fechaVencimiento,
      estadoCotizacion: "pendiente",
      numeroCotizacion: this.generarNumeroAleatorio(),
      totalCotizacion: this.totalCompra
    };

    this.cotizacionService.guardarCotizacion(cotizacion).subscribe({
      next: () => {
        Swal.fire("Éxito", "Cotización guardada correctamente", "success");
        this.cerrarModales();
      },
      error: (err) => {
        console.error(err);
        Swal.fire("Error", "No se pudo guardar la cotización", "error");
      }
    });
  }

  generarNumeroAleatorio(): string {
    return 'COT-' + Math.floor(100000 + Math.random() * 900000).toString();
  }

  confirmarPago() {
    console.log('Pago confirmado por:', this.totalCompra);
    this.cerrarModales();
  }

  listarProductos() {
    this.productosService.listarProductos().subscribe({
      next: (data: any) => {
        this.productos = data || [];
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
        console.error(err);
      }
    });
  }

  seleccionarCategoria(categoria: any): void {
    if (categoria?.idcategoria) {
      this.productosService.listarProductosPorCategoria(categoria.idcategoria).subscribe({
        next: (data: any) => {
          this.productos = data || [];
        },
        error: (err) => {
          Swal.fire("Error", "No se pudieron cargar los productos de esta categoría", "error");
          console.error(err);
        }
      });
    }
  }

  agregarProducto(producto: any): void {
    const existente = this.productosAgregados.find(p => p.idproducto === producto.idproducto);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.productosAgregados.push({
        ...producto,
        cantidad: 1,
        descuento: 0
      });
    }
  }

  get totalCompra(): number {
    return this.productosAgregados.reduce((total, item) =>
      total + item.cantidad * item.costoVenta * (1 - item.descuento / 100), 0
    );
  }
}
