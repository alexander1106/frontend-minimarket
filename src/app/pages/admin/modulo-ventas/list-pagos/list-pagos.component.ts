import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import baseUrl from '../../../../components/link';
import { PagosService } from '../../../../service/pagos.service';
import { CotizacionService } from '../../../../service/cotizacion.service';
import { LoginService } from '../../../../service/login.service';
import { MetodoPagoService } from '../../../../service/metodo-pago.service';

@Component({
  selector: 'app-list-pagos',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, BarraLateralComponent, FormsModule, HeaderComponent, CommonModule, RouterModule],
  templateUrl: './list-pagos.component.html',
  styleUrl: './list-pagos.component.css'
})
export class ListPagosComponent implements OnInit {
  pagos: any[] = [];
  filtrados: any[] = [];
  filtro = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  cotizaciones: any[] = [];
  metodosPago: any[] = [];
  cajaActiva: any = null;

  mostrandoFormulario = false;
  guardando = false;
  errores: Record<string, string> = {};
  aviso = '';
  nuevoPago: any = this.pagoVacio();

  readonly comprobantes = [
    { valor: 'BOLETA', etiqueta: 'Boleta', icono: 'fa-receipt' },
    { valor: 'FACTURA', etiqueta: 'Factura', icono: 'fa-file-invoice' }
  ];

  constructor(
    private pagosService: PagosService,
    private cotizacionesService: CotizacionService,
    private loginService: LoginService,
    private metodosPagoService: MetodoPagoService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.validarCajaActiva();
    this.listarPagos();
    this.listarCotizaciones();
    this.listarMetodosPago();
  }

  private pagoVacio(): any {
    return {
      cotizacionId: null,
      observaciones: '',
      fechaPago: this.hoy(),
      montoPagado: null,
      estadoPago: 'Realizado',
      metodoPagoId: null,
      comprobantePago: 'BOLETA'
    };
  }

  hoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private idSucursal(): number {
    return this.loginService.getUser()?.sucursal?.idSucursal || 1;
  }

  listarPagos(): void {
    this.cargando = true;
    this.pagosService.listarPagos().subscribe({
      next: (data: any) => {
        this.pagos = (Array.isArray(data) ? data : []).sort((a: any, b: any) => String(b.fechaPago).localeCompare(String(a.fechaPago)));
        this.cargando = false;
        this.buscar();
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar los pagos', 'error');
      }
    });
  }

  listarCotizaciones(): void {
    this.cotizacionesService.listarCotizacionesPorSucursal(this.idSucursal()).subscribe({
      next: (data: any) => {
        this.cotizaciones = (Array.isArray(data) ? data : []).filter((c: any) => c.estadoCotizacion === 'PENDIENTE');
      },
      error: () => (this.cotizaciones = [])
    });
  }

  listarMetodosPago(): void {
    this.metodosPagoService.listarMetodosPagoPorSucursal(this.idSucursal()).subscribe({
      next: (data: any) => (this.metodosPago = Array.isArray(data) ? data : []),
      error: () => (this.metodosPago = [])
    });
  }

  validarCajaActiva(): void {
    const usuario = this.loginService.getUser();
    if (!usuario) return;
    this.http.get(`${baseUrl}/aperturas-cajas/usuario/${usuario.idUsuario}/abierta`).subscribe({
      next: data => (this.cajaActiva = data || null),
      error: () => (this.cajaActiva = null)
    });
  }

  buscar(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t
      ? this.pagos.filter(p => [p.observaciones, p.estadoPago, p.comprobantePago, p.metodoPago?.nombre]
          .some(v => String(v ?? '').toLowerCase().includes(t)))
      : [...this.pagos];
    this.pagina = 1;
  }

  get totalCobrado(): number {
    return this.pagos.reduce((s, p) => s + Number(p.montoPagado || 0), 0);
  }

  get pagosHoy(): number {
    const hoy = this.hoy();
    return this.pagos.filter(p => String(p.fechaPago || '').slice(0, 10) === hoy).length;
  }

  claseEstado(p: any): string {
    return String(p?.estadoPago || '').toUpperCase() === 'REALIZADO' ? 'ok' : 'otro';
  }

  mostrarFormularioPago(): void {
    this.nuevoPago = this.pagoVacio();
    this.errores = {};
    this.aviso = this.cajaActiva ? '' : 'No tienes una caja abierta. Ábrela antes de registrar un pago.';
    this.mostrandoFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrandoFormulario = false;
  }

  onCotizacionSeleccionada(cotizacionId: any): void {
    this.nuevoPago.cotizacionId = cotizacionId;
    delete this.errores['cotizacionId'];
    const cotizacion = this.cotizaciones.find(c => c.idCotizaciones == cotizacionId);
    if (cotizacion) {
      this.nuevoPago.montoPagado = cotizacion.totalCotizacion || 0;
      this.nuevoPago.observaciones = 'Pago por cotización';
    } else {
      this.nuevoPago.montoPagado = null;
    }
  }

  elegirMetodo(m: any): void {
    this.nuevoPago.metodoPagoId = m.idMetodoPago;
    delete this.errores['metodoPagoId'];
  }

  guardarPago(): void {
    this.errores = {};
    this.aviso = '';
    const p = this.nuevoPago;
    if (!this.cajaActiva) {
      this.aviso = 'Debes abrir una caja antes de registrar el pago.';
      return;
    }
    if (!p.cotizacionId) this.errores['cotizacionId'] = 'Elige la cotización que se paga.';
    if (!(Number(p.montoPagado) > 0)) this.errores['montoPagado'] = 'El monto debe ser mayor a 0.';
    if (!p.metodoPagoId) this.errores['metodoPagoId'] = 'Elige un método de pago.';
    if (!p.fechaPago) this.errores['fechaPago'] = 'La fecha es obligatoria.';
    if (Object.keys(this.errores).length) return;

    const dto = {
      id_venta: p.cotizacionId,
      id_metodo_pago: p.metodoPagoId,
      observaciones: p.observaciones,
      fechaPago: p.fechaPago,
      montoPagado: Number(p.montoPagado),
      estadoPago: p.estadoPago,
      comprobantePago: p.comprobantePago,
      id_apertura_caja: this.cajaActiva.idAperturaCaja
    };

    this.guardando = true;
    this.pagosService.registrarPago(dto).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', 'Pago registrado correctamente', 'success');
        this.mostrandoFormulario = false;
        this.listarPagos();
        this.listarCotizaciones();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const e = err?.error;
        this.aviso = (typeof e === 'string' && e.trim()) ? e : (e?.message || e?.Detalle || e?.error || 'No se pudo registrar el pago');
      }
    });
  }
}
