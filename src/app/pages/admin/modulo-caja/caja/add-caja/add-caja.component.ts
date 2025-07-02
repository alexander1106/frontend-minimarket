import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SucursalesService } from '../../../../../service/sucursales.service';
import { CajasService } from '../../../../../service/cajas.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-caja',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './add-caja.component.html',
  styleUrls: ['./add-caja.component.css']
})
export class AddCajaComponent implements OnInit {
  @Input() cajaInput: any;
  @Input() cajas: any[] = [];   // <== NUEVO: recibe las cajas filtradas de la sucursal
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  caja: any = {
    nombreCaja: '',
    sucursal: null,
    saldoActual: 0,
    estadoCaja: 'ACTIVA'
  };

  sucursales: any[] = [];
  esEdicion: boolean = false;

  constructor(
    private sucursalesService: SucursalesService,
    private cajasService: CajasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.listarSucursales();

    if (this.cajaInput) {
      this.caja = { ...this.cajaInput };
      this.esEdicion = !!this.cajaInput.idCaja;
    }
  }

  listarSucursales() {
    this.sucursalesService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data || [];

        if (this.cajaInput) {
          this.caja = { ...this.cajaInput };
          this.esEdicion = !!this.cajaInput.idCaja;

          if (this.cajaInput.sucursal && this.cajaInput.sucursal.idSucursal) {
            const sucursalCompleta = this.sucursales.find(
              s => s.idSucursal === this.cajaInput.sucursal.idSucursal
            );
            this.caja.sucursal = sucursalCompleta ?? null;
          }
        }
      },
      error: (err) => {
        console.error('Error al listar sucursales:', err);
      }
    });
  }

  guardarCaja() {
    if (!this.caja.nombreCaja || this.caja.nombreCaja.trim() === '') {
      Swal.fire('Atención', 'El nombre de la caja es obligatorio.', 'warning');
      return;
    }

    if (!this.caja.sucursal || !this.caja.sucursal.idSucursal) {
      Swal.fire('Atención', 'Debes seleccionar una sucursal.', 'warning');
      return;
    }

    if (this.caja.saldoActual == null || this.caja.saldoActual < 0) {
      Swal.fire('Atención', 'El saldo debe ser mayor o igual a cero.', 'warning');
      return;
    }

    if (!this.caja.estadoCaja || this.caja.estadoCaja.trim() === '') {
      Swal.fire('Atención', 'Debes seleccionar un estado.', 'warning');
      return;
    }

    // Validar si existe el nombre en las cajas recibidas por Input
    const nombreActual = this.caja.nombreCaja.trim().toLowerCase();
    const idSucursalActual = this.caja.sucursal.idSucursal;

const existeCajaMismoNombre = this.cajas
.filter(c => c.sucursal && c.sucursal.idSucursal === idSucursalActual)
  .some(c => {
    const nombre = (c.nombreCaja || '').trim().toLowerCase();
    return (
      nombre === nombreActual &&
      (!this.caja.idCaja || c.idCaja !== this.caja.idCaja)
    );
  });


    if (existeCajaMismoNombre) {
      Swal.fire('Error', 'Ya existe una caja con ese nombre en esta sucursal.', 'error');
      return;
    }

    // Confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas guardar esta caja?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const dto: any = {
          nombreCaja: this.caja.nombreCaja.trim(),
          saldoActual: this.caja.saldoActual,
          estadoCaja: this.caja.estadoCaja,
          idSucursal: this.caja.sucursal.idSucursal,
          estado: 1
        };

        if (this.caja.idCaja) {
          dto.idCaja = this.caja.idCaja;

          this.cajasService.editarCaja(dto).subscribe({
            next: () => {
              Swal.fire('Actualizado', 'La caja se actualizó correctamente.', 'success').then(() => {
                this.guardado.emit();
                window.location.reload();
              });
            },
            error: (err) => {
              console.error('Error al actualizar la caja:', err);
              Swal.fire('Error', 'Ocurrió un error al actualizar la caja.', 'error');
            }
          });
        } else {
          this.cajasService.registrarCaja(dto).subscribe({
            next: () => {
              Swal.fire('Guardado', 'La caja se creó correctamente.', 'success').then(() => {
                this.guardado.emit();
                window.location.reload();
              });
            },
            error: (err) => {
              console.error('Error al guardar la caja:', err);
              Swal.fire('Error', 'Ocurrió un error al guardar la caja.', 'error');
            }
          });
        }
      }
    });
  }

  cancelar() {
    this.cerrar.emit();
    window.location.reload();
  }
}
