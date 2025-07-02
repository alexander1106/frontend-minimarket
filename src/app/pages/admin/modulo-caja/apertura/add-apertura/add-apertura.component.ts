import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AperturaCajaService } from '../../../../../service/apertura-caja.service'; // Ajusta la ruta si es necesario
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

  fechaApertura: string = '';
  monto: number = 0;
  idCaja: number | undefined;

constructor(
  private aperturaService: AperturaCajaService,
  private router: Router,
    private loginService: LoginService

) {}

  ngOnInit() {
    if (this.cajaPreseleccionada != null) {
      setTimeout(() => {
        this.idCaja = this.cajaPreseleccionada;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cajaPreseleccionada']) {
      if (this.cajaPreseleccionada != null) {
        this.idCaja = this.cajaPreseleccionada;
      }
    }
  }
guardar() {
  const usuario = this.loginService.getUser();

  if (!usuario || !usuario.idUsuario) {
    console.error('No se pudo obtener el usuario logueado.');
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo identificar al usuario logueado.',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  const nuevaApertura = {
    id_caja: this.idCaja,
    id_empleado: usuario.idUsuario,
    fechaApertura: this.fechaApertura,
    saldoInicial: this.monto,
    fechaCierre: null,
    estadoCaja: "ABIERTA",
    saldoFinal: null
  };

  console.log('Enviando apertura al backend:', nuevaApertura);

  this.aperturaService.registrarApertura(nuevaApertura).subscribe(
    (resp:any) => {
      console.log('Apertura guardada con éxito:', resp);

      // ⚠️ Asegúrate que tu backend retorne el ID de la apertura.
const idApertura = resp.idAperturaCaja;

      if (!idApertura) {
        console.warn('El backend no retornó el ID de la apertura.');
      }

      // Guarda también el ID de la apertura en localStorage
      localStorage.setItem('cajaActiva', JSON.stringify({
        idCaja: this.idCaja,
        nombreCaja: this.cajasDisponibles.find(c => c.idCaja === this.idCaja)?.nombreCaja || '',
        idUsuario: usuario.idUsuario,
        idApertura: idApertura // 👈 añade el idApertura
      }));

      console.log('Caja activa guardada en localStorage:', localStorage.getItem('cajaActiva'));

      Swal.fire({
        icon: 'success',
        title: '¡Apertura registrada!',
        text: 'La apertura de caja se guardó correctamente.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/admin/list-transacciones', this.idCaja]);
      });

      this.guardado.emit(resp);
      this.cerrar.emit();
    },
    (error) => {
      console.error('Error al guardar apertura:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.error || 'Ocurrió un error al guardar la apertura.',
        confirmButtonText: 'Aceptar'
      });
    }
  );
}

  cerrarModal() {
    this.cerrar.emit();
  }
}
