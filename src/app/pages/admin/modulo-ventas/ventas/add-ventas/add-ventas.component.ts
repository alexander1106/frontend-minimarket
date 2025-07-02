// ... tus imports
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
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../../clientes/add-cliente/add-cliente.component';
import { LoginService } from '../../../../../service/login.service';
import { PagosService } from '../../../../../service/pagos.service';

export interface CotizacionesDTO {
  id_cliente: number;
  fechaCotizacion: string;
  estadoCotizacion: string;
  numeroCotizacion: string;
  totalCotizacion: number;
  fechaVencimiento: string;
}

@Component({
  selector: 'app-add-ventas',
  standalone: true,
  imports: [
    BarraLateralComponent,
    HeaderComponent,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './add-ventas.component.html',
  styleUrls: ['./add-ventas.component.css']
})
export class AddVentasComponent implements OnInit {
  categorias: any[] = [];
  productos: any[] = [];
  productosAgregados: any[] = [];
  clientes: any[] = [];
  montoPago: number = 0;
  metodoPago: string | null = null;
  requiereDelivery: boolean = false;
  direccionEntrega: string = '';
  costoEntrega: number = 0;
  fechaEntrega: string = '';
  mostrarModalCotizacion = false;
  mostrarModalPago = false;
  clienteSeleccionado: any = null;
  fechaCotizacion: string = '';
  totalPagar: number = 182000;
  fechaVencimiento: string = '';
  idSucursal: number | null = null;
cajaActiva: any = null;
comprobantePago: string | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private cotizacionService: CotizacionService,
    private dialog: MatDialog,
    private loginService: LoginService,
    private pagosService: PagosService // ⬅️ Aquí lo agregas

  ) {}

  ngOnInit(): void {
    const usuario = this.loginService.getUser();
    if (usuario && usuario.sucursal && usuario.sucursal.idSucursal) {
      this.idSucursal = usuario.sucursal.idSucursal;
    } else {
      Swal.fire("Error", "No se encontró la sucursal del usuario", "error");
      return;
    }

    this.categoriasService.listarCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error('Error cargando categorías', err)
    });
const cajaGuardada = localStorage.getItem('cajaActiva');
  if (cajaGuardada) {
    const caja = JSON.parse(cajaGuardada);
    console.log('Caja activa recuperada:', caja);
    // Aquí puedes asignarla a una variable de tu componente
    this.cajaActiva = caja;
  } else {
    console.log('No hay caja activa guardada.');
  }
    this.listarClientes();
    this.listarProductos();
  }

  listarClientes() {
    this.clientesService.listarClientes().subscribe({
      next: (data: any) => this.clientes = data || [],
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
        console.error(err);
      }
    });
  }

 listarProductos() {
  if (!this.idSucursal) {
    Swal.fire("Error", "No se ha definido la sucursal", "error");
    return;
  }
  this.productosService.listarProductosPorSucursal(this.idSucursal).subscribe({
    next: (data: any) => {
      console.log('Productos recibidos de la API:', data); // 🚀 Aquí imprime los productos crudos
      this.productos = (data || []).map((p: any) => ({
        idproducto: p.producto?.idproducto || p.idproducto,
        nombre: p.producto?.nombre || p.nombre,
        costoVenta: p.producto?.costoVenta || p.costo_venta || p.costoVenta,
        imagen: p.producto?.imagen || p.imagen
      }));
      console.log('Productos mapeados:', this.productos); // 🚀 Aquí imprime los productos procesados
    },
    error: (err) => {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
      console.error(err);
    }
  });
}

  agregarProducto(producto: any): void {
    const existente = this.productosAgregados.find(p => p.producto.idproducto === producto.idproducto);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.productosAgregados.push({
        producto,
        cantidad: 1,
        descuento: 0
      });
    }
  }

  get totalCompra(): number {
    return this.productosAgregados.reduce((total, item) =>
      total + item.cantidad * item.producto.costoVenta * (1 - item.descuento / 100), 0
    );
  }

  seleccionarCategoria(categoria: any): void {
    if (categoria?.idcategoria) {
      this.productosService.listarProductosPorCategoria(categoria.idcategoria).subscribe({
        next: (data: any) => {
          this.productos = data || [];
        },
        error: (err) => {
          Swal.fire("Error", "No se pudieron cargar los productos", "error");
          console.error(err);
        }
      });
    }
  }

  abrirModalCotizacion() {
    this.mostrarModalCotizacion = true;
  }

 abrirModalPago() {
  if (!this.cajaActiva) {
    Swal.fire(
      "Caja no abierta",
      "No hay ninguna caja activa. Por favor, abra una caja antes de procesar pagos.",
      "warning"
    );
    return;
  }

  this.montoPago = this.totalCompra;
  this.metodoPago = null;
  this.requiereDelivery = false;
  this.mostrarModalPago = true;
}

  cerrarModales() {
    this.mostrarModalCotizacion = false;
    this.mostrarModalPago = false;
  }

  abrirFormularioCliente() {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '600px',
      data: { modo: 'crear' }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === 'guardado') {
        this.listarClientes();
        Swal.fire('Éxito', 'Cliente registrado correctamente', 'success');
      }
    });
  }

  generarCotizacion() {
    if (!this.clienteSeleccionado || !this.fechaVencimiento) {
      Swal.fire("Advertencia", "Debe seleccionar cliente y fecha", "warning");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaVencimientoDate = new Date(this.fechaVencimiento);
    fechaVencimientoDate.setHours(0, 0, 0, 0);

    if (fechaVencimientoDate <= hoy) {
      Swal.fire("Advertencia", "La fecha de vencimiento debe ser posterior a hoy", "warning");
      return;
    }

    const cotizacion: CotizacionesDTO = {
      id_cliente: this.clienteSeleccionado,
      fechaCotizacion: hoy.toISOString().split('T')[0],
      fechaVencimiento: this.fechaVencimiento,
      estadoCotizacion: "pendiente",
      numeroCotizacion: this.generarNumeroAleatorio(),
      totalCotizacion: this.totalCompra
    };

    this.cotizacionService.guardarCotizacion(cotizacion).subscribe({
      next: () => {
        Swal.fire("Éxito", "Cotización guardada correctamente", "success");
        this.cerrarModales();
        this.router.navigate(['/admin/list-cotizaciones']);
      },
      error: (err) => {
        console.error(err);
        Swal.fire("Error", "No se pudo guardar la cotización", "error");
      }
    });
  }

  generarNumeroAleatorio(): string {
    return 'COT-' + Math.floor(100000 + Math.random() * 900000);
  }
confirmarPago() {
  if (!this.metodoPago) {
    Swal.fire("Advertencia", "Debe seleccionar el método de pago", "warning");
    return;
  }

  if (!this.clienteSeleccionado) {
    Swal.fire("Advertencia", "Debe seleccionar el cliente", "warning");
    return;
  }

  const pago = {
    observaciones: this.requiereDelivery ? `Delivery a ${this.direccionEntrega}` : 'Pago en punto de venta',
    fechaPago: new Date(),
    montoPagado: this.montoPago,
    referenciaPago: 'N/A', // o un número de referencia real si aplica
    estadoPago: 'REALIZADO',
    estado: 1,
    id_metodo_pago:1,
    id_venta: 1 // TODO: reemplaza con el ID real de la venta creada
  };

  this.pagosService.registrarPago(pago).subscribe({
    next: () => {
      Swal.fire("Éxito", "Pago registrado correctamente", "success");
      this.cerrarModales();
      // Opcionalmente redirigir
      this.router.navigate(['/admin/list-ventas']);
    },
    error: (err) => {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    }
  });
}

  minFechaManana(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  }
}
