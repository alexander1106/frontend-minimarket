import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { ComprasService, CompraPayload, PreciosProducto, leerErrorCompras } from '../../../../service/compras.service';
import { LoginService } from '../../../../service/login.service';
import { AlmacenesService } from '../../../../service/almacenes.service';
import { InventarioService } from '../../../../service/inventario.service';
import { MetodoPagoService } from '../../../../service/metodo-pago.service';
import { Presentacion, PresentacionesService } from '../../../../service/presentaciones.service';
import { ProductosService } from '../../../../service/productos.service';
import { ProveedoresService } from '../../../../service/proveedores.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { UnidadInfo, UnidadProductoService } from '../../../../service/unidad-producto.service';

interface Linea {
  idProducto: number | null;
  idPresentacion: number | null;
  cantidad: number | null;
  precioCompra: number | null;
  precioVenta: number | null;
  presentaciones: Presentacion[];
  historial: PreciosProducto | null;
  conLote: boolean;
  lote: string;
  fechaVencimiento: string;
}

@Component({
  selector: 'app-form-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BarraLateralComponent, HeaderComponent],
  templateUrl: './form-compra.component.html',
  styleUrls: ['./form-compra.component.css']
})
export class FormCompraComponent implements OnInit {
  idCompra: number | null = null;
  cargando = true;
  guardando = false;

  idProveedor: number | null = null;
  idMetodoPago: number | null = null;
  idSucursal: number | null = null;
  descripcion = '';

  proveedores: any[] = [];
  sucursales: any[] = [];
  metodos: any[] = [];
  productos: any[] = [];
  unidades = new Map<number, UnidadInfo>();

  lineas: Linea[] = [];
  busqueda = '';
  abrirLista = false;
  erroresCabecera: Record<string, string> = {};
  erroresLinea: Record<number, Record<string, string>> = {};

  private idEmpresa: number | null = null;

  private almacenes: any[] = [];
  private inventarios: any[] = [];
  sucursalSinInventario = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comprasSvc: ComprasService,
    private loginService: LoginService,
    private proveedoresSvc: ProveedoresService,
    private sucursalesSvc: SucursalesService,
    private metodosSvc: MetodoPagoService,
    private productosSvc: ProductosService,
    private presentacionesSvc: PresentacionesService,
    private unidadesSvc: UnidadProductoService,
    private almacenesSvc: AlmacenesService,
    private inventarioSvc: InventarioService
  ) {}

  get editando(): boolean {
    return this.idCompra != null;
  }

  ngOnInit(): void {
    if (this.loginService.hasRole('SUPERADMIN') ||
        !this.loginService.puedeEscribirModulo('Compras', ['ADMIN', 'ALMACENERO', 'EMPRESA'])) {
      this.router.navigate(['/admin/compras']);
      return;
    }

    const empresa = this.loginService.getEmpresa();
    const user = this.loginService.getUser();
    this.idEmpresa = Number(empresa?.idempresa ?? empresa?.idEmpresa ?? user?.sucursal?.empresa?.idempresa) || null;
    this.idSucursal = user?.sucursal?.idSucursal ?? null;

    const param = this.route.snapshot.paramMap.get('id');
    this.idCompra = param ? Number(param) : null;

    forkJoin({
      proveedores: this.idEmpresa ? this.proveedoresSvc.listarPorEmpresa(this.idEmpresa).pipe(catchError(() => of([]))) : of([]),
      sucursales: this.idEmpresa ? this.sucursalesSvc.listarSucursalesPorEmpresas(this.idEmpresa).pipe(catchError(() => of([]))) : of([]),
      productos: this.productosSvc.listarProductos().pipe(catchError(() => of([]))),
      unidades: this.unidadesSvc.mapa(),
      almacenes: this.almacenesSvc.listarAlmacenes().pipe(catchError(() => of([]))),
      inventarios: this.inventarioSvc.listarInventario().pipe(catchError(() => of([]))),
      compra: this.idCompra ? this.comprasSvc.buscar(this.idCompra).pipe(catchError(err => of({ error: err }))) : of(null)
    }).subscribe(r => {
      this.unidades = r.unidades;
      this.almacenes = Array.isArray(r.almacenes) ? r.almacenes : [];
      this.inventarios = Array.isArray(r.inventarios) ? r.inventarios : [];
      this.productos = Array.isArray(r.productos) ? r.productos : [];
      this.sucursales = (Array.isArray(r.sucursales) ? r.sucursales : []).filter((s: any) => s.estado !== 0);
      const todos: any[] = Array.isArray(r.proveedores) ? r.proveedores : [];
      this.proveedores = todos.filter(p => p.estado === 1);

      if (this.idSucursal && !this.sucursales.some(s => s.idSucursal === this.idSucursal)) {
        const u = this.loginService.getUser()?.sucursal;
        this.sucursales.unshift({ idSucursal: this.idSucursal, nombreSucursal: u?.nombreSucursal || u?.nombre || 'Mi sucursal' });
      }

      const c: any = r.compra;
      if (c?.error) {
        this.cargando = false;
        Swal.fire('Compra no encontrada', leerErrorCompras(c.error).mensaje, 'warning')
          .then(() => this.router.navigate(['/admin/compras']));
        return;
      }
      if (c) this.cargarCompra(c);

      this.cargarMetodos();
      this.revisarInventario();
      this.cargando = false;
    });
  }

  private lineaVacia(): Linea {
    return { idProducto: null, idPresentacion: null, cantidad: 1, precioCompra: null, precioVenta: null, presentaciones: [], historial: null, conLote: false, lote: '', fechaVencimiento: '' };
  }

  private cargarCompra(r: { compra: any; detalles: any[] }): void {
    const c = r.compra || {};
    this.idProveedor = c.proveedor?.idProveedor ?? c.idProveedor ?? null;
    this.idMetodoPago = c.metodoPago?.idMetodoPago ?? c.idMetodoPago ?? null;
    this.idSucursal = c.sucursal?.idSucursal ?? c.idSucursal ?? this.idSucursal;
    this.descripcion = c.descripcion || '';

    if (this.idProveedor && !this.proveedores.some(p => p.idProveedor === this.idProveedor) && c.proveedor) {
      this.proveedores.unshift({ ...c.proveedor, nombre: `${c.proveedor.nombre} (inactivo)` });
    }

    this.lineas = (r.detalles || []).map(d => {
      const linea: Linea = {
        idProducto: d.producto?.idproducto ?? d.idProducto ?? null,
        idPresentacion: d.presentacion?.idPresentacion ?? d.idPresentacion ?? null,
        cantidad: Number(d.cantidad),
        precioCompra: d.precioCompra != null ? Number(d.precioCompra) : null,
        precioVenta: d.precioVenta != null ? Number(d.precioVenta) : null,
        presentaciones: [],
        historial: null,
        conLote: !!(d.lote || d.fechaVencimiento),
        lote: d.lote || '',
        fechaVencimiento: d.fechaVencimiento ? String(d.fechaVencimiento).slice(0, 10) : ''
      };
      if (linea.idProducto) this.cargarPresentaciones(linea);
      return linea;
    });
  }

  cargarMetodos(): void {
    if (!this.idSucursal) { this.metodos = []; return; }
    this.metodosSvc.listarMetodosPagoPorSucursal(this.idSucursal).subscribe({
      next: (data: any) => {
        this.metodos = Array.isArray(data) ? data : [];
        if (this.idMetodoPago && !this.metodos.some(m => m.idMetodoPago === this.idMetodoPago)) this.idMetodoPago = null;
      },
      error: () => (this.metodos = [])
    });
  }

  alCambiarSucursal(): void {
    this.idMetodoPago = null;
    this.cargarMetodos();
    this.revisarInventario();
  }

  private revisarInventario(): void {
    if (!this.idSucursal) { this.sucursalSinInventario = false; return; }
    const idsAlmacen = new Set(
      this.almacenes.filter(a => Number(a.idsucursal ?? a.idSucursal) === Number(this.idSucursal)).map(a => a.idalmacen)
    );
    this.sucursalSinInventario = ![...this.inventarios].some(i => idsAlmacen.has(i.idalmacen ?? i.almacen?.idalmacen));
  }

  get resultados(): any[] {
    const t = this.busqueda.trim().toLowerCase();
    if (!t) return [];
    return this.productos.filter(p => String(p.nombre || '').toLowerCase().includes(t)).slice(0, 8);
  }

  enLineas(idProducto: number): number {
    return this.lineas.filter(l => l.idProducto === idProducto).length;
  }

  agregarProducto(p: any): void {
    const linea = this.lineaVacia();
    linea.idProducto = p.idproducto;
    this.lineas.push(linea);
    this.alElegirProducto(linea);
    this.busqueda = '';
    this.abrirLista = false;
  }

  quitarLinea(i: number): void {
    this.lineas.splice(i, 1);
    this.erroresLinea = {};
  }

  @HostListener('document:click')
  cerrarLista(): void {
    this.abrirLista = false;
  }

  private cargarPresentaciones(l: Linea): void {
    if (!l.idProducto) return;
    this.presentacionesSvc.listarPorProducto(l.idProducto).subscribe({
      next: lista => (l.presentaciones = Array.isArray(lista) ? lista : []),
      error: () => (l.presentaciones = [])
    });
  }

  alElegirProducto(l: Linea): void {
    l.idPresentacion = null;
    l.presentaciones = [];
    l.historial = null;
    if (!l.idProducto) return;
    if (!this.unidades.get(l.idProducto)?.permiteDecimales) l.cantidad = Math.max(1, Math.round(Number(l.cantidad || 1)));
    this.cargarPresentaciones(l);
    l.conLote = this.esPerecible(l.idProducto) || l.conLote;
    // Ayuda de precios: los de la compra anterior (404 si nunca se compró)
    this.comprasSvc.precios(l.idProducto).subscribe({
      next: p => {
        l.historial = p || null;
        if (l.precioCompra == null && p?.precioCompra != null) l.precioCompra = Number(p.precioCompra);
        if (l.precioVenta == null && p?.precioVenta != null) l.precioVenta = Number(p.precioVenta);
      },
      error: () => (l.historial = null)
    });
  }

  alElegirPresentacion(l: Linea): void {
    const p = this.presentacionDe(l);
    if (!p) return;
    if (p.precioCompra != null) l.precioCompra = Number(p.precioCompra);
    if (p.precioVenta != null) l.precioVenta = Number(p.precioVenta);
  }

  /** Sin marca de "perecible" en el backend: se deduce del tipo de producto o de que ya tenga fecha de vencimiento. */
  esPerecible(id: number | null): boolean {
    const p = this.productos.find(x => x.idproducto === id);
    if (!p) return false;
    return !!p.fechaVencimiento || /perecib|fresc|l[aá]cte|refriger|carne|fruta|verdura/i.test(String(p.tipoProducto?.nombre || ''));
  }

  hoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  unidadDe(l: Linea): UnidadInfo | undefined {
    return l.idProducto ? this.unidades.get(l.idProducto) : undefined;
  }

  permiteDecimales(l: Linea): boolean {
    return !!this.unidadDe(l)?.permiteDecimales;
  }

  codigoUnidad(l: Linea): string {
    return this.unidadDe(l)?.codigo || 'und';
  }

  presentacionDe(l: Linea): Presentacion | null {
    if (!l.idPresentacion) return null;
    return l.presentaciones.find(p => p.idPresentacion === Number(l.idPresentacion)) || null;
  }

  equivalencia(l: Linea): string {
    const p = this.presentacionDe(l);
    if (!p || !l.cantidad) return '';
    const base = Math.round(Number(l.cantidad) * Number(p.factor) * 1000) / 1000;
    return `${this.cant(l.cantidad)} × ${p.nombre} = ${this.cant(base)} ${this.codigoUnidad(l)}`;
  }

  /** Margen de ganancia sobre el precio de compra, en %. null si falta algún precio. */
  margen(l: Linea): number | null {
    const compra = Number(l.precioCompra);
    const venta = Number(l.precioVenta);
    if (!compra || compra <= 0 || !venta || venta <= 0) return null;
    return ((venta - compra) / compra) * 100;
  }

  usarPreciosAnteriores(l: Linea): void {
    if (l.historial?.precioCompra != null) l.precioCompra = l.historial.precioCompra;
    if (l.historial?.precioVenta != null) l.precioVenta = l.historial.precioVenta;
  }

  subtotal(l: Linea): number {
    return Number(l.cantidad || 0) * Number(l.precioCompra || 0);
  }

  /** Σ cantidad × precio de compra. El total real lo calcula el servidor. */
  get total(): number {
    return this.lineas.reduce((s, l) => s + this.subtotal(l), 0);
  }

  errLinea(i: number, campo: string): string {
    return this.erroresLinea[i]?.[campo] || '';
  }

  nombreProducto(id: number | null): string {
    return this.productos.find(p => p.idproducto === id)?.nombre || '';
  }

  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  private alertar(titulo: string, mensaje: string, detalle: string[] = []): void {
    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lista = detalle.length ? `<ul style="text-align:left;margin:12px 0 0;padding-left:20px">${detalle.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
    Swal.fire({ icon: 'warning', title: titulo, html: `<p style="margin:0">${esc(mensaje)}</p>${lista}` });
  }

  private validar(): boolean {
    this.erroresCabecera = {};
    this.erroresLinea = {};
    const c = this.erroresCabecera;
    if (!this.idProveedor) c['proveedor'] = 'Elige un proveedor.';
    if (!this.idSucursal) c['sucursal'] = 'Elige una sucursal.';
    else if (this.sucursalSinInventario) c['sucursal'] = 'Crea un almacén e inventario para registrar compras.';
    if (!this.idMetodoPago) c['metodo'] = 'Elige un método de pago.';

    if (this.lineas.length === 0) c['lineas'] = 'Agrega al menos un producto.';
    this.lineas.forEach((l, i) => {
      const e: Record<string, string> = {};
      if (!l.idProducto) e['producto'] = 'Elige un producto.';
      const cantidad = Number(l.cantidad);
      if (!(cantidad > 0)) e['cantidad'] = 'La cantidad debe ser mayor a 0.';
      else if (l.idProducto && !this.permiteDecimales(l) && !Number.isInteger(cantidad)) {
        e['cantidad'] = `${this.nombreProducto(l.idProducto)} se maneja por unidades enteras.`;
      } else if (Math.abs(Math.round(cantidad * 1000) / 1000 - cantidad) > 1e-9) {
        e['cantidad'] = 'Máximo 3 decimales.';
      }
      if (!(Number(l.precioCompra) > 0)) e['precioCompra'] = 'Debe ser mayor a 0.';
      if (!(Number(l.precioVenta) > 0)) e['precioVenta'] = 'Debe ser mayor a 0.';
      if (l.conLote && l.fechaVencimiento && l.fechaVencimiento < this.hoy()) e['fechaVencimiento'] = 'La fecha de vencimiento no puede ser anterior a hoy.';
      if (l.conLote && l.lote.length > 60) e['lote'] = 'Máximo 60 caracteres.';
      if (Object.keys(e).length) this.erroresLinea[i] = e;
    });

    return Object.keys(c).length === 0 && Object.keys(this.erroresLinea).length === 0;
  }

  guardar(): void {
    if (!this.validar()) {
      this.alertar('Revisa los datos', this.erroresCabecera['lineas'] || 'Revisa los campos marcados.');
      return;
    }
    const payload: CompraPayload = {
      idProveedor: this.idProveedor as number,
      idMetodoPago: this.idMetodoPago as number,
      idSucursal: this.idSucursal as number,
      descripcion: this.descripcion.trim() || null,
      detalles: this.lineas.map(l => ({
        idProducto: l.idProducto as number,
        cantidad: Number(l.cantidad),
        ...(l.idPresentacion ? { idPresentacion: Number(l.idPresentacion) } : {}),
        precioCompra: Number(l.precioCompra),
        precioVenta: Number(l.precioVenta),
        ...(l.conLote && l.lote.trim() ? { lote: l.lote.trim() } : {}),
        ...(l.conLote && l.fechaVencimiento ? { fechaVencimiento: l.fechaVencimiento } : {})
      }))
    };

    this.guardando = true;
    const pet$ = this.idCompra ? this.comprasSvc.editar(this.idCompra, payload) : this.comprasSvc.registrar(payload);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', (this.idCompra ? 'Compra actualizada' : 'Compra registrada') + '. Stock actualizado.', 'success')
          .then(() => this.router.navigate(['/admin/compras']));
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const { mensaje, errores } = leerErrorCompras(err);
        const detalle = Object.entries(errores).map(([campo, texto]) => `${campo}: ${texto}`);
        if (err.status === 404) {
          Swal.fire('No encontrado', mensaje, 'warning').then(() => this.router.navigate(['/admin/compras']));
          return;
        }
        this.alertar('No se pudo guardar la compra', mensaje, detalle);
      }
    });
  }
}
