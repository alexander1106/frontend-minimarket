import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AperturaCajaService, TurnoAbierto } from '../../../../../service/apertura-caja.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { LoginService } from '../../../../../service/login.service';

@Component({
  selector: 'app-add-apertura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-apertura.component.html',
  styleUrls: ['./add-apertura.component.css']
})
export class AddAperturaComponent implements OnInit, OnChanges {
  @Input() cajasDisponibles: any[] = [];
  @Input() cajaPreseleccionada: number | undefined;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<any>();

  fechaApertura: string = this.ahora();
  monto: number = 0;
  idCaja: number | undefined;
  errores: Record<string, string> = {};
  aviso = '';
  guardando = false;
  turnos: TurnoAbierto[] = [];

  constructor(
    private aperturaService: AperturaCajaService,
    private router: Router,
    private loginService: LoginService
  ) {}

  private ahora(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  ngOnInit() {
    this.cargarTurnos();
    if (this.cajaPreseleccionada != null) {
      setTimeout(() => {
        if (this.esLibre(this.cajaPreseleccionada)) this.idCaja = this.cajaPreseleccionada;
      });
    }
  }

  private cargarTurnos(): void {
    const idSucursal = this.cajasDisponibles[0]?.sucursales?.idSucursal ?? this.loginService.getUser()?.sucursal?.idSucursal;
    if (!idSucursal) return;
    this.aperturaService.turnosAbiertosPorSucursal(idSucursal).subscribe({
      next: t => (this.turnos = Array.isArray(t) ? t : []),
      error: () => (this.turnos = [])
    });
  }

  private estadoDe(caja: any): 'libre' | 'ocupada' | 'malograda' {
    const e = String(caja?.estadoCaja || '').toUpperCase();
    if (e === 'MALOGRADA') return 'malograda';
    if (e === 'OCUPADA' || this.turnos.some(t => Number(t.idCaja) === Number(caja?.idCaja))) return 'ocupada';
    return 'libre';
  }

  private esLibre(idCaja: number | undefined): boolean {
    const caja = this.cajasDisponibles.find(c => c.idCaja === idCaja);
    return !!caja && this.estadoDe(caja) === 'libre';
  }

  get opciones(): { caja: any; estado: string; etiqueta: string }[] {
    return this.cajasDisponibles.map(caja => {
      const estado = this.estadoDe(caja);
      const turno = this.turnos.find(t => Number(t.idCaja) === Number(caja.idCaja));
      const etiqueta = estado === 'libre' ? caja.nombreCaja
        : estado === 'malograda' ? `${caja.nombreCaja} · malograda`
        : `${caja.nombreCaja} · en uso${turno?.cajero ? ' por ' + turno.cajero : ''}`;
      return { caja, estado, etiqueta };
    });
  }

  get hayLibres(): boolean {
    return this.opciones.some(o => o.estado === 'libre');
  }

  get resumenOcupadas(): string {
    return this.opciones.map(o => o.etiqueta).join(', ');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cajaPreseleccionada']) {
      if (this.cajaPreseleccionada != null) {
        this.idCaja = this.cajaPreseleccionada;
      }
    }
  }

  guardar() {
    this.errores = {};
    this.aviso = '';

    const usuario = this.loginService.getUser();
    if (!usuario || !usuario.idUsuario) {
      this.aviso = 'No se pudo identificar al usuario logueado.';
      return;
    }

    const cajaSeleccionada = this.cajasDisponibles.find(c => c.idCaja === this.idCaja);
    if (!cajaSeleccionada) this.errores['idCaja'] = 'Selecciona una caja.';
    else if (!this.esLibre(this.idCaja)) this.errores['idCaja'] = 'Esa caja no está libre.';
    if (this.monto == null || Number(this.monto) < 0) this.errores['monto'] = 'El monto inicial no puede ser negativo.';
    if (!this.fechaApertura) this.errores['fechaApertura'] = 'La fecha es obligatoria.';
    if (Object.keys(this.errores).length) return;

    const nuevaApertura = {
      id_caja: this.idCaja,
      id_empleado: usuario.idUsuario,
      fechaApertura: this.fechaApertura,
      saldoInicial: Number(this.monto),
    };

    this.guardando = true;
    this.aperturaService.registrarApertura(nuevaApertura).subscribe({
      next: (resp: any) => {
        this.guardando = false;
        localStorage.setItem('cajaActiva', JSON.stringify({
          idCaja: this.idCaja,
          nombreCaja: cajaSeleccionada.nombreCaja,
          idUsuario: usuario.idUsuario,
          idApertura: resp?.idAperturaCaja
        }));

        Swal.fire({
          icon: 'success',
          title: '¡Apertura registrada!',
          text: 'La apertura de caja se guardó correctamente.'
        }).then(() => {
          this.router.navigate(['/admin/list-apertura']);
        });

        this.guardado.emit(resp);
        this.cerrar.emit();
      },
      error: (error: any) => {
        this.guardando = false;
        if (error.status === 401 || error.status === 403) return;
        const e = error?.error;
        const mensaje = (typeof e === 'string' && e.trim()) ? e : (e?.message || e?.Detalle || 'Ocurrió un error al abrir la caja.');
        Swal.fire({ icon: error.status === 409 || error.status === 400 ? 'warning' : 'error', title: 'No se pudo abrir la caja', text: mensaje });
        this.cargarTurnos();
      }
    });
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
