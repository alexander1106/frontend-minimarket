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
  import { MetodoPagoService } from '../../../../../service/metodo-pago.service';
  import { VentasService } from '../../../../../service/ventas.service';
  import { TransaccionesCajaService } from '../../../../../service/transacciones-caja.service';
  import { DetallesCotizacionesService } from '../../../../../service/detalles-cotizaciones.service';
import baseUrl from '../../../../../components/link';
import { HttpClient } from '@angular/common/http';

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
    metodosDePago: any[] = [];
mostrarModalDetalleVenta = false;
ventaSeleccionada: any = null;
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
    totalPagar: number = 0;
    fechaVencimiento: string = '';
    idSucursal: number | null = null;
    cajaActiva: any = null;
    comprobantePago: string | null = null;
    todosLosProductosSucursal: any[]=[];
  categoriaSeleccionada: any = null;


    constructor(
      private categoriasService: CategoriasService,
      private router: Router,
      private productosService: ProductosService,
      private clientesService: ClientesService,
      private cotizacionService: CotizacionService,
      private dialog: MatDialog,
      private loginService: LoginService,
      private pagosService: PagosService,
      private detallesCotizacionesService:DetallesCotizacionesService,
      private metodosPago: MetodoPagoService,
      private http:HttpClient,
      private transaccionesCajaService:TransaccionesCajaService,
      private ventasService: VentasService // <<-- AÑADIDO
    ) {}

    ngOnInit(): void {
const usuario = this.loginService.getUser();
if (!usuario) {
  Swal.fire("Error", "No se encontró el usuario logueado", "error");
  return;
}

this.http.get(`${baseUrl}/aperturas-caja/usuario/${usuario.idUsuario}/abierta`)
  .subscribe({
    next: (data) => {
      if (data) {
        this.cajaActiva = data;
        console.log('Caja activa cargada:', this.cajaActiva);

      } else {
        console.log('No hay caja activa.');
      }
    },
    error: (err) => {
      console.error('Error consultando la caja activa:', err);
      Swal.fire("Error", "No se pudo consultar la caja activa", "error");
    }
  });


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


      this.listarClientes();
      this.listarProductos();
      this.listarMetodosPagoPorSucursal();
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

  listarMetodosPagoPorSucursal() {
    if (!this.idSucursal) {
      Swal.fire("Error", "No se ha definido la sucursal", "error");
      return;
    }

    this.metodosPago.listarMetodosPagoPorSucursal(this.idSucursal).subscribe({
      next: (data: any) => {
        this.metodosDePago = data || [];
      },
      error: (err) => {
        console.error('Error cargando métodos de pago de la sucursal', err);
        Swal.fire("Error", "No se pudieron cargar los métodos de pago de esta sucursal", "error");
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
      const productosProcesados = (data || [])
        .map((p: any) => ({
          idproducto: p.producto?.idproducto || p.idproducto,
          nombre: p.producto?.nombre || p.nombre,
          costoVenta: p.producto?.costoVenta || p.costo_venta || p.costoVenta,
          imagen: p.producto?.imagen || p.imagen,
          idcategoria: p.producto?.categoria?.idcategoria || p.idcategoria,
          stock: p.producto?.stockactual || p.stockactual || 0// 👈 OK aquí
        }))
        .filter((p: { stock: number }) => p.stock > 0); // 👈 Solo productos con stock

      this.productos = productosProcesados;
      this.todosLosProductosSucursal = productosProcesados;
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
      this.totalPagar = this.totalCompra;
    }

    get totalCompra(): number {
      return this.productosAgregados.reduce((total, item) =>
        total + item.cantidad * item.producto.costoVenta * (1 - item.descuento / 100), 0
      );
    }
  seleccionarCategoria(categoria: any): void {
    this.categoriaSeleccionada = categoria;
    if (categoria?.idcategoria) {
      this.productos = this.todosLosProductosSucursal.filter(
        p => p.idcategoria === categoria.idcategoria
      );
    }
  }

  mostrarTodosLosProductos(): void {
    this.productos = this.todosLosProductosSucursal;
  }

    abrirModalCotizacion() {
      this.mostrarModalCotizacion = true;
    }

    abrirModalPago() {
      if (!this.tieneCajaAbiertaPorUsuario()) {
        Swal.fire(
          "Caja no abierta",
          "No hay ninguna caja activa por tu usuario. Por favor, abre una caja antes de procesar pagos.",
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

confirmarPago() {
  if (!this.tieneCajaAbiertaPorUsuario()) {
    Swal.fire("Caja no abierta", "Debes abrir caja antes de confirmar el pago.", "warning");
    return;
  }

  if (!this.metodoPago) {
    Swal.fire("Advertencia", "Seleccione un método de pago", "warning");
    return;
  }

  if (!this.clienteSeleccionado) {
    Swal.fire("Advertencia", "Seleccione un cliente", "warning");
    return;
  }

  const venta = {
    idSucursal: this.idSucursal,
    id_cliente: this.clienteSeleccionado,
    tipo_comprobante: this.comprobantePago,
    total_venta: this.totalCompra,
    estado: 1,
    detalles: this.productosAgregados.map(item => ({
      id_producto: item.producto.idproducto,
      pecioUnitario: item.producto.costoVenta,
      cantidad: item.cantidad,
      subTotal: item.producto.costoVenta * item.cantidad * (1 - item.descuento / 100),
      estado: 1
    })),
    montoPagado: this.montoPago,
    estadoPago: 'REALIZADO',
    observaciones: this.requiereDelivery
      ? `Delivery a ${this.direccionEntrega}`
      : 'Pago en punto de venta',
    id_metodo_pago: Number(this.metodoPago)
  };

  this.ventasService.registrar(venta).subscribe({
    next: (ventaGuardada: any) => {
const idVentaCreada = ventaGuardada.id_venta;
      alert(idVentaCreada)
      if (this.requiereDelivery) {
     const delivery = {
  direccion: this.direccionEntrega,
  fechaEnvio: new Date().toISOString(),
  fechaEntrega: this.fechaEntrega,
  encargado: "",
  costoEnvio: this.costoEntrega,
  observaciones: `Delivery generado desde punto de venta`,
  estado: 1,
  idCliente:this.clienteSeleccionado,
  idVenta: idVentaCreada
};


        this.http.post(`${baseUrl}/delivery`, delivery).subscribe({
          next: () => {
            this.registrarTransaccionVenta();
          },
          error: (err) => {
            console.error('Error registrando delivery:', err);
            Swal.fire("Error", "La venta fue creada pero no se pudo registrar el delivery", "warning");
            this.registrarTransaccionVenta();
          }
        });
      } else {
        this.registrarTransaccionVenta();
      }
    },
    error: (err) => {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar la venta", "error");
    }
  });
}

registrarTransaccionVenta() {
  const transaccion = {
    fecha: new Date().toISOString(),
    monto: this.montoPago,
    observaciones: `Ingreso por venta`,
    tipoMovimiento: 'INGRESO',
    idMetodoPago: Number(this.metodoPago),
    id_apertura_caja: this.cajaActiva.idAperturaCaja
  };

  this.transaccionesCajaService.registrarTransaccion(transaccion).subscribe({
    next: () => {
      Swal.fire("Éxito", "Venta registrada correctamente", "success");
      this.cerrarModales();
      this.router.navigate(['/admin/list-ventas']);
    },
    error: (err) => {
      console.error('Error registrando transacción:', err);
      Swal.fire("Error parcial", "La venta se registró, pero la transacción en caja falló", "warning");
      this.cerrarModales();
      this.router.navigate(['/admin/list-ventas']);
    }
  });
}

tieneCajaAbiertaPorUsuario(): boolean {
  return !!this.cajaActiva;
}

    generarNumeroAleatorio(): string {
      return 'COT-' + Math.floor(100000 + Math.random() * 900000);
    }

    minFechaManana(): string {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      return manana.toISOString().split('T')[0];
    }
  generarCotizacion() {
    // ✅ Validar stock antes de continuar
  const productosSinStock = this.productosAgregados.filter(p =>
    p.cantidad > (p.producto.stock || 0)
  );

 if (productosSinStock.length > 0) {
  Swal.fire({
    icon: 'warning',
    title: 'Stock insuficiente',
    html: `No hay stock suficiente para los siguientes productos:<br><strong>${productosSinStock.map(p => p.producto.nombre).join(', ')}</strong>`,
    confirmButtonText: 'Aceptar'
  });
  return;
}


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
      estadoCotizacion: "PENDIENTE",
      numeroCotizacion: this.generarNumeroAleatorio(),
      totalCotizacion: this.totalCompra
    };

    this.cotizacionService.guardarCotizacion(cotizacion).subscribe({
      next: (respuesta) => {
        // 🚩 Aquí recibes la cotización creada
        console.log('Cotización creada:', respuesta);

        const idCotizacionCreada = respuesta.idCotizaciones; // Cambia el nombre si tu backend devuelve otro campo

        if (!idCotizacionCreada) {
          Swal.fire("Error", "El servidor no devolvió el ID de la cotización creada", "error");
          return;
        }

        // Registrar cada detalle
        const peticiones = this.productosAgregados.map((item) => {
          const detalle = {
            id_producto: item.producto.idproducto,
            id_cotizacion: idCotizacionCreada,
            cantidad: item.cantidad,
            precioUnitario: item.producto.costoVenta,
            subTotal: item.producto.costoVenta * item.cantidad * (1 - item.descuento / 100),
            fechaCotizaciones: hoy.toISOString().split('T')[0]
          };

          return this.detallesCotizacionesService.registrarDetalle(detalle);
        });

        // Ejecutar todas las llamadas
        Promise.all(peticiones.map(p => p.toPromise()))
          .then(() => {
            Swal.fire("Éxito", "Cotización y detalles guardados correctamente", "success");
            this.cerrarModales();
            this.router.navigate(['/admin/list-cotizaciones']);
          })
          .catch((err) => {
            console.error('Error guardando los detalles', err);
            Swal.fire("Error parcial", "La cotización se creó, pero algunos detalles no se guardaron correctamente.", "warning");
            this.router.navigate(['/admin/list-cotizaciones']);

          });
      },
      error: (err) => {
        console.error(err);
        Swal.fire("Error", "No se pudo guardar la cotización", "error");
      }
    });
  }



  }
