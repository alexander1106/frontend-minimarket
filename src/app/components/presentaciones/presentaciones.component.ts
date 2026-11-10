import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Presentacion, PresentacionPayload, PresentacionesService } from '../../service/presentaciones.service';
import { Lote, LotesService } from '../../service/lotes.service';
import { LoginService } from '../../service/login.service';

interface FormPresentacion {
  idPresentacion: number;
  nombre: string;
  factor: number | null;
  precioVenta: number | null;
  precioCompra: number | null;
  codigoBarras: string;
}

@Component({
  selector: 'app-presentaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentaciones.component.html',
  styleUrls: ['./presentaciones.component.css']
})
export class PresentacionesComponent implements OnInit {
  @Input() producto: any;
  @Input() puedeEscribir = true;
  @Output() cerrar = new EventEmitter<void>();

  readonly rapidas = [
    { nombre: 'Docena', factor: 12 },
    { nombre: 'Media docena', factor: 6 },
    { nombre: 'Caja x24', factor: 24 },
    { nombre: 'Saco 25 kg', factor: 25 },
    { nombre: 'Saco 50 kg', factor: 50 }
  ];

  presentaciones: Presentacion[] = [];
  cargando = true;
  guardando = false;
  form: FormPresentacion = this.formVacio();
  errores: Record<string, string> = {};
  avisoForm = '';

  pestana: 'presentaciones' | 'lotes' = 'presentaciones';
  lotes: Lote[] = [];
  cargandoLotes = false;
  lotesCargados = false;
  errorLotes = '';

  constructor(
    private svc: PresentacionesService,
    private lotesSvc: LotesService,
    private loginService: LoginService
  ) {}

  elegirPestana(p: 'presentaciones' | 'lotes'): void {
    this.pestana = p;
    if (p === 'lotes' && !this.lotesCargados) this.cargarLotes();
  }

  cargarLotes(): void {
    this.cargandoLotes = true;
    this.errorLotes = '';
    const idSucursal = this.loginService.getUser()?.sucursal?.idSucursal;
    this.lotesSvc.porProducto(this.producto.idproducto, idSucursal).subscribe({
      next: lista => {
        this.lotes = Array.isArray(lista) ? lista : [];
        this.cargandoLotes = false;
        this.lotesCargados = true;
      },
      error: (err: any) => {
        this.cargandoLotes = false;
        this.lotes = [];
        if (err.status === 404) this.errorLotes = 'El producto no existe.';
        else if (err.status !== 401 && err.status !== 403) this.errorLotes = 'No se pudieron cargar los lotes.';
      }
    });
  }

  get totalDisponibleLotes(): number {
    return this.lotes.reduce((s, l) => s + Number(l.cantidadDisponible || 0), 0);
  }

  /** vencido (rojo), vence en 7 días o menos (naranja) o vigente (verde). */
  estadoLote(l: Lote): 'vencido' | 'pronto' | 'ok' | 'sin' {
    if (l.vencido) return 'vencido';
    if (l.diasParaVencer == null) return 'sin';
    return l.diasParaVencer <= 7 ? 'pronto' : 'ok';
  }

  textoVence(l: Lote): string {
    if (l.diasParaVencer == null) return 'Sin fecha';
    if (l.vencido) return `Vencido hace ${Math.abs(l.diasParaVencer)} d`;
    if (l.diasParaVencer === 0) return 'Vence hoy';
    return `En ${l.diasParaVencer} d`;
  }

  cant(n: any): string {
    return String(Number(Number(n || 0).toFixed(3)));
  }

  ngOnInit(): void {
    this.cargar();
  }

  get unidad(): any {
    return this.producto?.unidadMedida || {};
  }

  get codigoUnidad(): string {
    return this.unidad.codigo || this.unidad.nombre || 'und';
  }

  get permiteDecimales(): boolean {
    return !!this.unidad.permiteDecimales;
  }

  get pasoFactor(): string {
    return this.permiteDecimales ? '0.001' : '1';
  }

  get equivalenciaVivo(): string {
    const f = Number(this.form.factor);
    if (!this.form.nombre.trim() || !this.form.factor || !(f > 0)) return '';
    return `1 ${this.form.nombre.trim()} = ${Number(f.toFixed(3))} ${this.codigoUnidad}`;
  }

  aplicarRapida(r: { nombre: string; factor: number }): void {
    if (!this.puedeEscribir) return;
    this.form.nombre = r.nombre;
    this.form.factor = r.factor;
    this.errores = {};
  }

  private formVacio(): FormPresentacion {
    return { idPresentacion: 0, nombre: '', factor: null, precioVenta: null, precioCompra: null, codigoBarras: '' };
  }

  cargar(): void {
    this.cargando = true;
    this.svc.listarPorProducto(this.producto.idproducto).subscribe({
      next: data => {
        this.presentaciones = Array.isArray(data) ? data : [];
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) {
          Swal.fire('Error', err.error?.message || 'No se pudieron cargar las presentaciones', 'error');
        }
      }
    });
  }

  editar(p: Presentacion): void {
    if (!this.puedeEscribir) return;
    this.errores = {};
    this.avisoForm = '';
    this.form = {
      idPresentacion: p.idPresentacion,
      nombre: p.nombre,
      factor: p.factor,
      precioVenta: p.precioVenta,
      precioCompra: p.precioCompra,
      codigoBarras: p.codigoBarras || ''
    };
  }

  cancelarEdicion(): void {
    this.form = this.formVacio();
    this.errores = {};
    this.avisoForm = '';
  }

  private validar(): boolean {
    const err: Record<string, string> = {};
    const f = this.form;
    const nombre = f.nombre.trim();
    if (!nombre) err['nombre'] = 'El nombre es obligatorio.';
    else if (nombre.length > 80) err['nombre'] = 'Máximo 80 caracteres.';

    const factor = Number(f.factor);
    if (f.factor == null || (f.factor as any) === '' || !(factor > 0)) {
      err['factor'] = 'El factor debe ser mayor que 0.';
    } else if (!this.permiteDecimales && !Number.isInteger(factor)) {
      err['factor'] = `La unidad ${this.codigoUnidad} no permite decimales: el factor debe ser entero.`;
    } else if (Math.abs(Math.round(factor * 1000) / 1000 - factor) > 1e-9) {
      err['factor'] = 'El factor admite como máximo 3 decimales.';
    }

    const vacio = (v: any) => v == null || v === '';
    if (!vacio(f.precioVenta) && !(Number(f.precioVenta) >= 0)) err['precioVenta'] = 'El precio de venta no puede ser negativo.';
    if (!vacio(f.precioCompra) && !(Number(f.precioCompra) >= 0)) err['precioCompra'] = 'El precio de compra no puede ser negativo.';
    if (f.codigoBarras.trim().length > 40) err['codigoBarras'] = 'Máximo 40 caracteres.';
    this.errores = err;
    return Object.keys(err).length === 0;
  }

  guardar(): void {
    if (!this.puedeEscribir) return;
    this.avisoForm = '';
    if (!this.validar()) return;

    const f = this.form;
    const payload: PresentacionPayload = {
      ...(f.idPresentacion ? { idPresentacion: f.idPresentacion } : {}),
      nombre: f.nombre.trim(),
      factor: Number(f.factor),
      precioVenta: f.precioVenta == null || (f.precioVenta as any) === '' ? null : Number(f.precioVenta),
      precioCompra: f.precioCompra == null || (f.precioCompra as any) === '' ? null : Number(f.precioCompra),
      codigoBarras: f.codigoBarras.trim() || null
    };

    this.guardando = true;
    const edita = !!f.idPresentacion;
    const pet$ = edita ? this.svc.editar(payload) : this.svc.registrar(this.producto.idproducto, payload);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', edita ? 'Presentación actualizada' : 'Presentación registrada', 'success');
        this.cancelarEdicion();
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        const campos = err.error?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
          this.avisoForm = err.error?.message || '';
        } else if (err.status === 404) {
          Swal.fire('No encontrado', err.error?.message || 'La presentación o el producto ya no existe', 'warning');
          this.cancelarEdicion();
          this.cargar();
        } else if (err.status === 409) {
          this.errores['nombre'] = err.error?.message || 'Ya existe una presentación con ese nombre.';
        } else if (err.status !== 401 && err.status !== 403) {
          this.avisoForm = err.error?.message || 'No se pudo guardar la presentación';
        }
      }
    });
  }

  eliminar(p: Presentacion): void {
    if (!this.puedeEscribir) return;
    Swal.fire({
      title: `¿Eliminar "${p.nombre}"?`,
      text: 'No podrás deshacer esto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(p.idPresentacion).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Presentación eliminada', 'success');
          if (this.form.idPresentacion === p.idPresentacion) this.cancelarEdicion();
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          if (err.status === 404) {
            Swal.fire('No encontrado', err.error?.message || 'La presentación ya no existe', 'warning');
            this.cargar();
            return;
          }
          Swal.fire({ icon: err.status === 409 ? 'info' : 'error', title: err.status === 409 ? 'No se puede eliminar' : 'Error', text: err.error?.message || 'No se pudo eliminar la presentación' });
        }
      });
    });
  }
}
