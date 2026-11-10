import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SucursalesService } from '../../../../../service/sucursales.service';
import { CajasService } from '../../../../../service/cajas.service';
import { LoginService } from '../../../../../service/login.service';
import { AperturaCajaService } from '../../../../../service/apertura-caja.service';

@Component({
  selector: 'app-add-caja',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './add-caja.component.html',
  styleUrls: ['./add-caja.component.css']
})
export class AddCajaComponent implements OnInit {
  @Input() cajaInput: any;
  @Input() cajas: any[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  caja: any = {
    nombreCaja: '',
    sucursal: null,
    saldoActual: 0,
    estadoCaja: 'LIBRE'
  };

  readonly estados = [
    { valor: 'LIBRE', etiqueta: 'Libre', ayuda: 'Lista para abrir', icono: 'fa-lock-open', clase: 'libre' },
    { valor: 'OCUPADA', etiqueta: 'Ocupada', ayuda: 'Con un turno abierto', icono: 'fa-user-clock', clase: 'ocupada' },
    { valor: 'MALOGRADA', etiqueta: 'Malograda', ayuda: 'Fuera de servicio', icono: 'fa-screwdriver-wrench', clase: 'malograda' }
  ];

  sucursales: any[] = [];
  tieneAperturaAbierta = false;
  esEdicion = false;
  guardando = false;
  aviso = '';
  errores: Record<string, string> = {};

  constructor(
    private sucursalesService: SucursalesService,
    private cajasService: CajasService,
    private loginService: LoginService,
    private aperturaService: AperturaCajaService
  ) {}

  ngOnInit(): void {
    if (this.cajaInput) {
      this.caja = { ...this.cajaInput };
      this.esEdicion = !!this.cajaInput.idCaja;
    }
    if (!this.estados.some(e => e.valor === this.caja.estadoCaja)) this.caja.estadoCaja = 'LIBRE';
    this.listarSucursales();
    if (this.esEdicion) this.revisarApertura();
  }

  private revisarApertura(): void {
    this.aperturaService.listarAperturas().subscribe({
      next: (data: any) => {
        const lista: any[] = Array.isArray(data) ? data : [];
        this.tieneAperturaAbierta = lista.some(a =>
          Number(a.caja?.idCaja) === Number(this.caja.idCaja) && String(a.estadoCaja || '').toLowerCase() === 'abierta');
        if (this.tieneAperturaAbierta && this.caja.estadoCaja === 'LIBRE') this.caja.estadoCaja = 'OCUPADA';
      },
      error: () => {}
    });
  }

  bloqueada(estado: string): boolean {
    return this.tieneAperturaAbierta && estado === 'LIBRE';
  }

  elegirEstado(estado: string): void {
    if (this.bloqueada(estado)) return;
    this.caja.estadoCaja = estado;
  }

  listarSucursales(): void {
    this.sucursalesService.listarSucursales().subscribe({
      next: (data: any) => {
        this.sucursales = Array.isArray(data) ? data : [];
        const idActual = this.caja.sucursal?.idSucursal ?? this.loginService.getUser()?.sucursal?.idSucursal;
        this.caja.sucursal = this.sucursales.find(s => s.idSucursal === idActual) ?? null;
      },
      error: () => {
        this.aviso = 'No se pudieron cargar las sucursales.';
      }
    });
  }

  guardarCaja(): void {
    this.errores = {};
    this.aviso = '';
    const c = this.caja;
    if (!(c.nombreCaja || '').trim()) this.errores['nombreCaja'] = 'El nombre de la caja es obligatorio.';
    if (!c.sucursal?.idSucursal) this.errores['sucursal'] = 'Debes seleccionar una sucursal.';
    if (c.saldoActual == null || c.saldoActual === '' || Number(c.saldoActual) < 0) this.errores['saldoActual'] = 'El saldo debe ser 0 o mayor.';
    if (!c.estadoCaja) this.errores['estadoCaja'] = 'Debes elegir un estado.';
    else if (this.bloqueada(c.estadoCaja)) this.errores['estadoCaja'] = 'La caja tiene una apertura abierta: no puede quedar libre hasta cerrarla.';
    if (Object.keys(this.errores).length) return;

    const dto: any = {
      nombreCaja: c.nombreCaja.trim(),
      saldoActual: Number(c.saldoActual),
      estadoCaja: c.estadoCaja,
      idSucursal: c.sucursal.idSucursal,
      estado: 1
    };
    if (c.idCaja) dto.idCaja = c.idCaja;

    this.guardando = true;
    const pet$ = c.idCaja ? this.cajasService.editarCaja(dto) : this.cajasService.registrarCaja(dto);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', c.idCaja ? 'La caja se actualizó correctamente' : 'La caja se creó correctamente', 'success');
        this.guardado.emit();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpo = err.error;
        if (err.status === 409 && cuerpo?.error === 'CAJA_DUPLICADA') this.errores['nombreCaja'] = cuerpo.mensaje;
        else this.aviso = (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message || cuerpo?.mensaje) || 'Ocurrió un error al guardar la caja.';
      }
    });
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}
