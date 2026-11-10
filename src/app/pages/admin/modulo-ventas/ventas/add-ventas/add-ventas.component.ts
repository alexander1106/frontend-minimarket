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
  import { UnidadMedidaService } from '../../../../../service/unidad-medida.service';
  import { PresentacionesService, Presentacion } from '../../../../../service/presentaciones.service';
  import { DetallesCotizacionesService } from '../../../../../service/detalles-cotizaciones.service';
import baseUrl from '../../../../../components/link';
import { HttpClient } from '@angular/common/http';
import { AperturaCajaService, TurnoAbierto } from '../../../../../service/apertura-caja.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

  export interface CotizacionesDTO {
    id_cliente: number;
    fechaCotizacion: string;
    estadoCotizacion: string;
    numeroCotizacion?: string;
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
    sugerencias: { principal: string; secundario: string; texto: string }[] = [];
    mostrarSugerencias = false;
    buscandoDireccion = false;
    direccionSinResultados = false;
    private temporizadorDireccion: any;
    private consultaDireccion = 0;
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
    turnos: TurnoAbierto[] = [];
    turnoSeleccionado: number | null = null;
    buscandoCodigo = false;
    comprobantePago: string | null = null;
    readonly comprobantes = [
      { valor: 'BOLETA', etiqueta: 'Boleta', icono: 'fa-receipt' },
      { valor: 'FACTURA', etiqueta: 'Factura', icono: 'fa-file-invoice' },
      { valor: 'TICKET', etiqueta: 'Ticket', icono: 'fa-ticket' },
      { valor: 'RECIBO', etiqueta: 'Recibo', icono: 'fa-file-lines' }
    ];

    modoCliente: 'simple' | 'cliente' = 'simple';
    mostrandoNuevoCliente = false;
    nuevoCliente = { documento: '', nombre: '', apellidos: '', telefono: '' };
    consultandoDocumento = false;
    guardandoCliente = false;
    avisoDocumento = '';
    errorCliente = '';
    todosLosProductosSucursal: any[]=[];
  categoriaSeleccionada: any = null;
  busqueda = '';

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
      private unidadesService: UnidadMedidaService,
      private presentacionesService: PresentacionesService,
      private transaccionesCajaService:TransaccionesCajaService,
      private ventasService: VentasService,
      private aperturaService: AperturaCajaService
    ) {}

    ngOnInit(): void {
const usuario = this.loginService.getUser();
if (!usuario) {
  Swal.fire("Error", "No se encontró el usuario logueado", "error");
  return;
}

this.cargarTurnos(usuario);

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

  forkJoin({
    inventario: this.productosService.listarProductosPorSucursal(this.idSucursal),
    catalogo: this.productosService.listarProductos().pipe(catchError(() => of([]))),
    unidades: this.unidadesService.listarUnidadesMedida().pipe(catchError(() => of([])))
  }).subscribe({
    next: ({ inventario, catalogo, unidades }: any) => {
      const unidadPorId = new Map<number, any>((unidades || []).map((u: any) => [u.idunidadmedida, u]));
      const unidadDeProducto = new Map<number, any>(
        (catalogo || []).map((p: any) => [p.idproducto, unidadPorId.get(p.idunidadmedida)])
      );
      const productosProcesados = (inventario || [])
        .map((p: any) => {
          const id = p.producto?.idproducto || p.idproducto;
          const unidad = unidadDeProducto.get(id) || p.producto?.unidadMedida || null;
          return {
            idproducto: id,
            nombre: p.producto?.nombre || p.nombre,
            costoVenta: p.producto?.costoVenta || p.costo_venta || p.costoVenta,
            imagen: p.producto?.imagen || p.imagen,
            idcategoria: p.producto?.categoria?.idcategoria || p.idcategoria,
            stock: Number(p.producto?.stockactual || p.stockactual || 0),
            unidadCodigo: unidad?.codigo || unidad?.nombre || '',
            permiteDecimales: !!unidad?.permiteDecimales
          };
        })
        .filter((p: { stock: number }) => p.stock > 0);

      this.productos = productosProcesados;
      this.todosLosProductosSucursal = productosProcesados;
    },
    error: (err: any) => {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
      console.error(err);
    }
  });
}


    get puedeElegirCaja(): boolean {
      return this.loginService.hasAnyRole(['ADMIN', 'EMPRESA', 'SUPERVISOR']);
    }

    private cargarTurnos(usuario: any): void {
      const idSucursal = usuario?.sucursal?.idSucursal;
      const sinTurno = () => { this.cajaActiva = null; this.turnoSeleccionado = null; };
      const propio = () => {
        this.aperturaService.miTurnoAbierto(usuario.idUsuario).subscribe({
          next: (t: any) => {
            if (t?.idAperturaCaja) {
              this.cajaActiva = t;
              this.turnoSeleccionado = t.idAperturaCaja;
            } else sinTurno();
          },
          error: () => sinTurno()
        });
      };
      if (!idSucursal) { propio(); return; }
      this.aperturaService.turnosAbiertosPorSucursal(idSucursal).subscribe({
        next: lista => {
          this.turnos = Array.isArray(lista) ? lista : [];
          const mio = this.turnos.find(t => t.esMia);
          const elegido = this.puedeElegirCaja ? (mio || this.turnos[0]) : mio;
          if (elegido) this.elegirTurno(elegido.idAperturaCaja);
          else if (!this.puedeElegirCaja) propio();
          else sinTurno();
        },
        error: () => propio()
      });
    }

    elegirTurno(id: any): void {
      const turno = this.turnos.find(t => t.idAperturaCaja === Number(id));
      this.turnoSeleccionado = turno ? turno.idAperturaCaja : null;
      this.cajaActiva = turno || null;
    }

    irAbrirCaja(): void {
      this.router.navigate(['/admin/list-apertura']);
    }

    buscarPorCodigo(): void {
      const codigo = this.busqueda.trim();
      if (!codigo || this.buscandoCodigo) return;
      this.buscandoCodigo = true;
      this.http.get<any>(`${baseUrl}/productos/codigo/${encodeURIComponent(codigo)}`).subscribe({
        next: r => {
          this.buscandoCodigo = false;
          const id = r?.producto?.idproducto ?? r?.producto?.idProducto;
          const local = this.todosLosProductosSucursal?.find((p: any) => p.idproducto === id) || this.productos.find(p => p.idproducto === id);
          if (!local) {
            Swal.fire('Sin stock en esta sucursal', 'El producto existe, pero no está disponible en tu sucursal.', 'info');
            return;
          }
          this.agregarProducto(local, r?.idPresentacion ?? null);
          this.busqueda = '';
        },
        error: err => {
          this.buscandoCodigo = false;
          if (err.status === 401 || err.status === 403) return;
          if (err.status !== 404) {
            Swal.fire('Error', err?.error?.message || 'No se pudo buscar el código', 'error');
            return;
          }
          const porNombre = this.productosFiltrados;
          if (porNombre.length === 1) {
            this.agregarProducto(porNombre[0]);
            this.busqueda = '';
          } else if (porNombre.length === 0) {
            Swal.fire('Código no encontrado', 'No hay un producto con ese código', 'warning');
          }
        }
      });
    }

    agregarProducto(producto: any, idPresentacion: number | null = null): void {
      const existente = this.productosAgregados.find(p => p.producto.idproducto === producto.idproducto && (p.idPresentacion ?? null) === idPresentacion);
      if (existente) {
        existente.cantidad = this.redondear(Number(existente.cantidad || 0) + 1, producto);
      } else {
        const item: any = {
          producto,
          cantidad: 1,
          descuento: 0,
          idPresentacion: idPresentacion,
          presentaciones: [] as Presentacion[]
        };
        this.productosAgregados.push(item);
        this.presentacionesService.listarPorProducto(producto.idproducto).subscribe({
          next: lista => (item.presentaciones = Array.isArray(lista) ? lista : []),
          error: () => (item.presentaciones = [])
        });
      }
      this.totalPagar = this.totalCompra;
    }

    pasoCantidad(item: any): string {
      return item?.producto?.permiteDecimales ? '0.001' : '1';
    }

    private redondear(valor: number, producto: any): number {
      return producto?.permiteDecimales ? Math.round(valor * 1000) / 1000 : Math.round(valor);
    }

    presentacionDe(item: any): Presentacion | null {
      if (!item?.idPresentacion) return null;
      return (item.presentaciones || []).find((p: Presentacion) => p.idPresentacion === Number(item.idPresentacion)) || null;
    }

    factorDe(item: any): number {
      return Number(this.presentacionDe(item)?.factor || 1);
    }

    precioUnitarioDe(item: any): number {
      const pres = this.presentacionDe(item);
      const base = Number(item?.producto?.costoVenta || 0);
      if (!pres) return base;
      return pres.precioVenta != null ? Number(pres.precioVenta) : base * Number(pres.factor || 1);
    }

    cantidadBaseDe(item: any): number {
      return Math.round(Number(item?.cantidad || 0) * this.factorDe(item) * 1000) / 1000;
    }

    equivalenciaDe(item: any): string {
      const pres = this.presentacionDe(item);
      if (!pres) return '';
      const cod = item.producto?.unidadCodigo || 'und';
      return `${this.formatoCantidad(item.cantidad)} × ${pres.nombre} = ${this.formatoCantidad(this.cantidadBaseDe(item))} ${cod}`;
    }

    /** Cantidad sin ceros sobrantes: 2.5, no 2.500. */
    formatoCantidad(n: any): string {
      return String(Number(Number(n || 0).toFixed(3)));
    }

    alCambiarPresentacion(item: any): void {
      this.totalPagar = this.totalCompra;
    }

    alEditarCantidad(item: any): void {
      const v = Number(item.cantidad);
      if (!isFinite(v) || v <= 0) return;
      this.totalPagar = this.totalCompra;
    }

    normalizarCantidad(item: any): void {
      let v = Number(item.cantidad);
      if (!isFinite(v) || v <= 0) v = 1;
      item.cantidad = this.redondear(v, item.producto) || (item.producto?.permiteDecimales ? 0.001 : 1);
      this.totalPagar = this.totalCompra;
    }

    get productosFiltrados(): any[] {
      const q = this.busqueda.trim().toLowerCase();
      return q ? this.productos.filter(p => String(p.nombre || '').toLowerCase().includes(q)) : this.productos;
    }

    cambiarCantidad(item: any, delta: number): void {
      const paso = item.producto?.permiteDecimales ? 0.5 : 1;
      const nuevo = Number(item.cantidad || 0) + delta * paso;
      item.cantidad = Math.max(item.producto?.permiteDecimales ? 0.001 : 1, this.redondear(nuevo, item.producto));
      this.totalPagar = this.totalCompra;
    }

    quitarProducto(item: any): void {
      this.productosAgregados = this.productosAgregados.filter(p => p !== item);
      this.totalPagar = this.totalCompra;
    }

    cancelarVenta(): void {
      this.productosAgregados = [];
      this.totalPagar = 0;
    }

    subtotalItem(item: any): number {
      return this.precioUnitarioDe(item) * (item?.cantidad || 0) * (1 - (item?.descuento || 0) / 100);
    }

    get cantidadItems(): number {
      return this.productosAgregados.length;
    }

    get totalCompra(): number {
      return this.productosAgregados.reduce((total, item) => total + this.subtotalItem(item), 0);
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
      this.comprobantePago = 'BOLETA';
      this.modoCliente = 'simple';
      this.clienteSeleccionado = null;
      this.mostrandoNuevoCliente = false;
      this.avisoDocumento = '';
      this.errorCliente = '';
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
    Swal.fire({
      icon: 'warning',
      title: 'Caja no abierta',
      text: 'Debes tener un turno de caja abierto para cobrar.',
      showCancelButton: true,
      confirmButtonText: 'Abrir caja',
      cancelButtonText: 'Cancelar'
    }).then(r => { if (r.isConfirmed) this.irAbrirCaja(); });
    return;
  }

  if (!this.comprobantePago) {
    Swal.fire("Advertencia", "Elige el tipo de comprobante", "warning");
    return;
  }

  if (!this.metodoPago) {
    Swal.fire("Advertencia", "Seleccione un método de pago", "warning");
    return;
  }

  if (this.modoCliente === 'cliente' && !this.clienteSeleccionado) {
    Swal.fire("Advertencia", "Elige un cliente o cambia a boleta simple", "warning");
    return;
  }

  if (this.comprobantePago === 'FACTURA' && this.modoCliente === 'simple') {
    Swal.fire("Advertencia", "La factura necesita un cliente con RUC", "warning");
    return;
  }

  if (this.productosAgregados.length === 0) {
    Swal.fire("Advertencia", "Agregue al menos un producto", "warning");
    return;
  }

  const sinStock = this.productosAgregados.filter(p => this.cantidadBaseDe(p) > (p.producto.stock || 0));
  if (sinStock.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      html: `No hay stock suficiente para:<br><strong>${sinStock.map(p => p.producto.nombre).join(', ')}</strong>`,
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  this.resolverCliente().subscribe({
    next: idCliente => this.registrarVenta(idCliente),
    error: () => Swal.fire("Error", "No se pudo preparar el cliente de la venta", "error")
  });
}

private registrarVenta(idCliente: number) {
  const venta: any = {
    idSucursal: this.idSucursal,
    id_cliente: idCliente,
    tipo_comprobante: this.comprobantePago,
    total_venta: this.totalCompra,
    estado: 1,
    detalles: this.productosAgregados.map(item => ({
      id_producto: item.producto.idproducto,
      idPresentacion: item.idPresentacion ? Number(item.idPresentacion) : null,
      pecioUnitario: this.precioUnitarioDe(item),
      cantidad: Number(item.cantidad),
      subTotal: this.subtotalItem(item),
      estado: 1
    })),
    montoPagado: this.montoPago,
    estadoPago: 'REALIZADO',
    observaciones: this.requiereDelivery
      ? `Delivery a ${this.direccionEntrega}`
      : 'Pago en punto de venta',
    id_metodo_pago: Number(this.metodoPago),
    // El backend registra el ingreso en caja en la misma transacción de la venta
    id_apertura_caja: this.cajaActiva.idAperturaCaja
  };

  // El backend crea el envío (estado "Pendiente") en la misma transacción
  if (this.requiereDelivery) {
    venta.delivery = {
      direccion: this.direccionEntrega,
      fechaEnvio: new Date().toISOString(),
      fechaEntrega: this.fechaEntrega || null,
      encargado: "",
      costoEnvio: this.costoEntrega,
      observaciones: "Delivery generado desde punto de venta",
      estado: 1
    };
  }

  this.ventasService.registrar(venta).subscribe({
    next: () => {
      Swal.fire("Éxito", "Venta registrada correctamente", "success");
      this.cerrarModales();
      this.router.navigate(['/admin/list-venta']);
    },
    error: (err) => {
      console.error(err);
      if (err.status === 403) return; // lo informa el interceptor
      // 400 { status, Detalle }: "Stock insuficiente… Disponible: X, solicitado: Y" o "…unidades enteras…"
      const detalle = err?.error?.Detalle || err?.error?.message;
      Swal.fire({
        icon: err.status === 400 ? 'warning' : 'error',
        title: err.status === 400 ? 'No se pudo registrar la venta' : 'Error',
        text: detalle || "No se pudo registrar la venta"
      });
    }
  });
}

/** Boleta simple: se vende al cliente genérico "CLIENTES VARIOS" (documento 00000000), que se crea la primera vez. */
private resolverCliente(): Observable<number> {
  if (this.modoCliente === 'cliente') return of(Number(this.clienteSeleccionado));

  const generico = this.clientes.find(c => String(c.documento) === '00000000');
  if (generico) return of(generico.idCliente);

  return this.clientesService.registrarCliente({
    nombre: 'CLIENTES',
    apellidos: 'VARIOS',
    tipoDocumento: 'DNI',
    documento: '00000000',
    telefono: '',
    email: '',
    direccion: '',
    sucursal: { idSucursal: this.idSucursal }
  }).pipe(
    map((r: any) => Number(r?.idCliente)),
    map(id => {
      if (!id) throw new Error('sin id');
      this.listarClientes();
      return id;
    })
  );
}

elegirModoCliente(modo: 'simple' | 'cliente') {
  this.modoCliente = modo;
  this.errorCliente = '';
  if (modo === 'simple') {
    this.clienteSeleccionado = null;
    this.mostrandoNuevoCliente = false;
    if (this.comprobantePago === 'FACTURA') this.comprobantePago = 'BOLETA';
  }
}

elegirComprobante(valor: string) {
  this.comprobantePago = valor;
  if (valor === 'FACTURA' && this.modoCliente === 'simple') this.modoCliente = 'cliente';
}

elegirMetodo(m: any) {
  this.metodoPago = String(m.idMetodoPago);
}

abrirNuevoCliente() {
  this.mostrandoNuevoCliente = true;
  this.nuevoCliente = { documento: '', nombre: '', apellidos: '', telefono: '' };
  this.avisoDocumento = '';
  this.errorCliente = '';
}

cerrarNuevoCliente() {
  this.mostrandoNuevoCliente = false;
}

get tipoDocumentoNuevo(): string {
  return this.nuevoCliente.documento.length === 11 ? 'RUC' : 'DNI';
}

/** Solo números; al llegar a 8 (DNI) u 11 (RUC) dígitos consulta la API y rellena los datos. */
alEscribirDocumento() {
  this.nuevoCliente.documento = this.nuevoCliente.documento.replace(/\D/g, '').slice(0, 11);
  this.avisoDocumento = '';
  this.errorCliente = '';
  const doc = this.nuevoCliente.documento;

  const existente = this.clientes.find(c => String(c.documento) === doc);
  if (existente) {
    this.clienteSeleccionado = existente.idCliente;
    this.mostrandoNuevoCliente = false;
    Swal.fire('Cliente ya registrado', `${existente.nombre} ${existente.apellidos || ''} ya está registrado y quedó seleccionado.`, 'info');
    return;
  }

  if (doc.length === 8 || doc.length === 11) this.consultarDocumento();
}

consultarDocumento() {
  const doc = this.nuevoCliente.documento;
  if (doc.length !== 8 && doc.length !== 11) return;
  if (!this.clientesService.consultaDocumentoConfigurada) {
    this.avisoDocumento = 'Consulta de documentos no disponible: escribe los datos a mano.';
    return;
  }

  this.consultandoDocumento = true;
  this.avisoDocumento = '';
  const consulta$ = doc.length === 8 ? this.clientesService.consultarDni(doc) : this.clientesService.consultarRuc(doc);
  consulta$.subscribe({
    next: (r: any) => {
      this.consultandoDocumento = false;
      if (this.nuevoCliente.documento !== doc) return;
      if (doc.length === 8) {
        this.nuevoCliente.nombre = r?.nombres || '';
        this.nuevoCliente.apellidos = [r?.apellidoPaterno, r?.apellidoMaterno].filter(Boolean).join(' ');
      } else {
        this.nuevoCliente.nombre = r?.razonSocial || '';
        this.nuevoCliente.apellidos = '-';
      }
      this.avisoDocumento = this.nuevoCliente.nombre
        ? 'Datos cargados desde la consulta de documentos'
        : 'No se encontraron datos para ese documento. Escríbelos a mano.';
    },
    error: (err: any) => {
      this.consultandoDocumento = false;
      this.avisoDocumento = err.status === 404
        ? 'No se encontró ese documento. Escribe los datos a mano.'
        : err.status === 429
          ? 'Demasiadas consultas seguidas. Espera un momento o escribe los datos a mano.'
          : 'No se pudo consultar el documento. Escribe los datos a mano.';
    }
  });
}

guardarNuevoCliente() {
  const c = this.nuevoCliente;
  this.errorCliente = '';
  if (c.documento.length !== 8 && c.documento.length !== 11) {
    this.errorCliente = 'El documento debe tener 8 dígitos (DNI) u 11 (RUC).';
    return;
  }
  if (!c.nombre.trim()) {
    this.errorCliente = 'El nombre es obligatorio.';
    return;
  }

  this.guardandoCliente = true;
  this.clientesService.registrarCliente({
    nombre: c.nombre.trim(),
    apellidos: c.apellidos.trim() || '-',
    telefono: c.telefono.trim(),
    email: '',
    tipoDocumento: this.tipoDocumentoNuevo,
    documento: c.documento,
    direccion: '',
    sucursal: { idSucursal: this.idSucursal }
  }).subscribe({
    next: (r: any) => {
      this.guardandoCliente = false;
      this.mostrandoNuevoCliente = false;
      this.clientesService.listarClientes().subscribe({
        next: (data: any) => {
          this.clientes = data || [];
          const creado = this.clientes.find(x => x.idCliente === r?.idCliente) || this.clientes.find(x => String(x.documento) === c.documento);
          if (creado) this.clienteSeleccionado = creado.idCliente;
        }
      });
    },
    error: (err: any) => {
      this.guardandoCliente = false;
      if (err.status === 401 || err.status === 403) return;
      const cuerpo = err.error;
      this.errorCliente = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'No se pudo guardar el cliente.';
    }
  });
}

get faltaPagar(): number {
  return Math.max(0, Math.round((this.totalCompra - Number(this.montoPago || 0)) * 100) / 100);
}

tieneCajaAbiertaPorUsuario(): boolean {
  return !!this.cajaActiva;
}

    minFechaManana(): string {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      return manana.toISOString().split('T')[0];
    }
  generarCotizacion() {
  const productosSinStock = this.productosAgregados.filter(p =>
    this.cantidadBaseDe(p) > (p.producto.stock || 0)
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
      totalCotizacion: this.totalCompra
    };

    this.cotizacionService.guardarCotizacion(cotizacion).subscribe({
      next: (respuesta) => {
        console.log('Cotización creada:', respuesta);

        const idCotizacionCreada = respuesta.idCotizaciones;

        if (!idCotizacionCreada) {
          Swal.fire("Error", "El servidor no devolvió el ID de la cotización creada", "error");
          return;
        }

        const peticiones = this.productosAgregados.map((item) => {
          const detalle = {
            id_producto: item.producto.idproducto,
            id_cotizacion: idCotizacionCreada,
            idPresentacion: item.idPresentacion ? Number(item.idPresentacion) : null,
            cantidad: Number(item.cantidad),
            precioUnitario: this.precioUnitarioDe(item),
            subTotal: this.subtotalItem(item),
            fechaCotizaciones: hoy.toISOString().split('T')[0]
          };

          return this.detallesCotizacionesService.registrarDetalle(detalle);
        });

        Promise.all(peticiones.map(p => p.toPromise()))
          .then(() => {
            Swal.fire("Éxito", `Cotización ${respuesta.numeroCotizacion || ''} y detalles guardados correctamente`, "success");
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

  
  buscarDireccion(texto: string): void {
    clearTimeout(this.temporizadorDireccion);
    const q = (texto || '').trim();
    this.direccionSinResultados = false;
    if (q.length < 4) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      this.buscandoDireccion = false;
      return;
    }
    this.temporizadorDireccion = setTimeout(() => this.consultarDirecciones(q), 450);
  }

  private async consultarDirecciones(q: string): Promise<void> {
    const id = ++this.consultaDireccion;
    this.buscandoDireccion = true;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=pe&accept-language=es&q=${encodeURIComponent(q)}`;
      const resp = await fetch(url);
      const datos: any[] = resp.ok ? await resp.json() : [];
      if (id !== this.consultaDireccion) return;
      this.sugerencias = datos.map(d => {
        const partes = String(d.display_name || '').split(',').map((x: string) => x.trim());
        return {
          principal: partes.slice(0, 2).join(', '),
          secundario: partes.slice(2, 5).join(', '),
          texto: partes.filter(x => !/^\d{5}$/.test(x) && x !== 'Perú').join(', ')
        };
      });
      this.mostrarSugerencias = this.sugerencias.length > 0;
      this.direccionSinResultados = this.sugerencias.length === 0;
    } catch {
      if (id !== this.consultaDireccion) return;
      this.sugerencias = [];
      this.mostrarSugerencias = false;
    } finally {
      if (id === this.consultaDireccion) this.buscandoDireccion = false;
    }
  }

  elegirDireccion(d: { texto: string }): void {
    this.direccionEntrega = d.texto;
    this.sugerencias = [];
    this.mostrarSugerencias = false;
    this.direccionSinResultados = false;
    this.consultaDireccion++;
  }
}
