import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AperturaCajaService } from '../../../../../service/apertura-caja.service'; // Ajusta la ruta si es necesario
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
  private router: Router
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
  const nuevaApertura = {
    id_caja: this.idCaja,
    id_empleado: 1, // Cambia por el id real del empleado
    fechaApertura: this.fechaApertura,
    saldoInicial: this.monto,
    fechaCierre: null,
    estadoCaja: "ABIERTA",
    saldoFinal: null
  };

  console.log('Enviando apertura al backend:', nuevaApertura);

  this.aperturaService.registrarApertura(nuevaApertura).subscribe(
    (resp) => {
      console.log('Apertura guardada con éxito:', resp);

      // GUARDA LA CAJA ACTUAL EN LOCALSTORAGE
      localStorage.setItem('cajaActiva', JSON.stringify({
        idCaja: this.idCaja,
        nombreCaja: this.cajasDisponibles.find(c => c.idCaja === this.idCaja)?.nombreCaja || ''
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
