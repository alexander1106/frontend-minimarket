import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AperturaCajaService } from '../../../../../service/apertura-caja.service';
import { MetodoPagoService } from '../../../../../service/metodo-pago.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BarraLateralComponent } from "../../../../../components/barra-lateral/barra-lateral.component";
import { HeaderComponent } from "../../../../../components/header/header.component";
import { TransaccionesCajaService } from '../../../../../service/transacciones-caja.service';
import Swal from 'sweetalert2';
import { CajasService } from '../../../../../service/cajas.service';
import { TranseferenciaEntreCajasService } from '../../../../../service/transeferencia-entre-cajas.service';

@Component({
  selector: 'app-list-transacciones',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-transacciones.component.html',
  styleUrls: ['./list-transacciones.component.css']
})
export class ListTransaccionesComponent implements OnInit {
  detalleCaja: any;
  mostrarFormularioTransaccion = false;
  mostrarFormularioTransferencia = false;

  // Formulario transacción normal
  fecha: string = '';
  monto: number = 0;
  observaciones: string = '';
  tipoMovimiento: string = 'INGRESO';
  idMetodoPago: number | undefined;
  idAperturaCaja: number | undefined;

  // Formulario transferencia entre cajas
  idCajaOrigen: number | undefined;
  idCajaDestino: number | undefined;
  montoTransferencia: number = 0;
  conceptoTransferencia: string = '';
  cajas: any[] = [];

  // Listas
  transacciones: any[] = [];
  transaccionesPaginadas: any[] = [];
  metodosPago: any[] = [];
  idMetodoPagoTransferencia: number | undefined;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  constructor(
    private route: ActivatedRoute,
    private aperturaService: AperturaCajaService,
    private CajasService: CajasService,
    private metodoPagoService: MetodoPagoService,
    private transaccionService: TransaccionesCajaService,
    private transaccionesEntreCajas:TranseferenciaEntreCajasService,
  private router: Router // <<-- AQUI
  ) {}

ngOnInit() {
  const idParam = this.route.snapshot.paramMap.get('idAperturaCaja');

  if (idParam) {
    this.idAperturaCaja = Number(idParam);
    console.log('ID recibido:', this.idAperturaCaja);

    // 🚩 PASO 1: Obtener apertura
    this.aperturaService.buscarAperturaId(this.idAperturaCaja).subscribe(
      (data) => {
        this.detalleCaja = data;
        console.log('Detalle de la apertura:', this.detalleCaja);

        const idCaja = this.detalleCaja?.idCaja || this.detalleCaja?.caja?.idCaja;


        if (idCaja) {
          console.log('ID de la Caja de esta apertura:', idCaja);

          this.idCajaOrigen = idCaja; // preseleccionar caja origen

          // 🚩 PASO 2: Obtener sucursal con las cajas
          this.CajasService.obtenerSucursalPorCaja(idCaja).subscribe(
            (sucursal: any) => {
              console.log('Sucursal:', sucursal);

              const idSucursal = sucursal.idSucursal;
              if (idSucursal) {
                console.log('ID Sucursal:', idSucursal);

            // 🚩 PASO 3: Cargar las cajas de la sucursal
                if (sucursal.cajas && Array.isArray(sucursal.cajas)) {
                  this.cajas = sucursal.cajas.filter((c: any) => c.estadoCaja === 'OCUPADA');
                  console.log('Cajas abiertas obtenidas:', this.cajas);
                } else {
                  console.warn('La sucursal no contiene una lista de cajas.');
                  this.cajas = [];
                }
              } else {
                console.warn('Sucursal sin idSucursal.');
              }
            },
            (error) => {
              console.error('Error al obtener la sucursal:', error);
            }
          );
        } else {
          console.warn('No se encontró idCaja en la apertura.');
        }
      },
      (error) => {
        console.error('Error al obtener la apertura:', error);
      }
    );

    // 🚩 Transacciones filtradas
    this.transaccionService.listarTransacciones().subscribe(
      (data) => {
        this.transacciones = data.filter((t: any) =>
          t.aperturaCaja?.idAperturaCaja === this.idAperturaCaja
        );
        this.actualizarPaginacion();
      },
      (error) => {
        console.error('Error al obtener transacciones:', error);
      }
    );
  } else {
    console.warn('No se encontró idAperturaCaja en la URL');
  }

  // Métodos de pago
  this.metodoPagoService.listarMetodosPago().subscribe(
    (data) => {
      this.metodosPago = data;
    },
    (error) => {
      console.error('Error al cargar métodos de pago:', error);
    }
  );
}


  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.transacciones.length / this.itemsPorPagina));
  }

  abrirFormularioTransaccion() {
    this.mostrarFormularioTransaccion = true;
    this.mostrarFormularioTransferencia = false;
    this.fecha = new Date().toISOString();
  }

  formularioTransferenciaEntreCajas() {
    this.mostrarFormularioTransferencia = true;
    this.mostrarFormularioTransaccion = false;
  }

  cancelarTransaccion() {
    this.mostrarFormularioTransaccion = false;
  }

  cancelarTransferencia() {
    this.mostrarFormularioTransferencia = false;
  }

  guardarTransaccion() {
    const nuevaTransaccion = {
      fecha: this.fecha,
      monto: this.monto,
      observaciones: this.observaciones,
      tipoMovimiento: this.tipoMovimiento,
      idMetodoPago: this.idMetodoPago,
      idCaja: this.detalleCaja?.idCaja,
      id_apertura_caja: this.detalleCaja?.idAperturaCaja
    };

    this.transaccionService.registrarTransaccion(nuevaTransaccion).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Transacción guardada',
          text: 'La transacción se registró correctamente.'
        }).then(() => window.location.reload());

        this.mostrarFormularioTransaccion = false;
        this.resetearFormulario();
      },
      (error) => {
        console.error('Error al registrar transacción:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar la transacción.'
        });
      }
    );
  }

  guardarTransferencia() {
    if (this.idCajaOrigen === this.idCajaDestino) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La caja origen y destino no pueden ser la misma.'
      });
      return;
    }

    const transferencia = {
      id_caja_origen: this.idCajaOrigen,
      id_caja_destino: this.idCajaDestino,
      monto: this.montoTransferencia,
      observaciones: this.conceptoTransferencia,
        idMetodoPago: this.idMetodoPagoTransferencia,

      fecha: new Date().toISOString()
    };

    this.transaccionesEntreCajas.registrarTransferenciasEntreCajas(transferencia).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Transferencia registrada',
          text: 'La transferencia se guardó correctamente.'
        }).then(() => window.location.reload());

        this.mostrarFormularioTransferencia = false;
        this.resetearFormularioTransferencia();
      },
      (error) => {
        console.error('Error al registrar transferencia:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar la transferencia.'
        });
      }
    );
  }




  resetearFormulario() {
    this.monto = 0;
    this.observaciones = '';
    this.tipoMovimiento = 'INGRESO';
    this.idMetodoPago = undefined;
  }

resetearFormularioTransferencia() {
  this.idCajaOrigen = undefined;
  this.idCajaDestino = undefined;
  this.montoTransferencia = 0;
  this.conceptoTransferencia = '';
  this.idMetodoPagoTransferencia = undefined;
}

  actualizarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.transaccionesPaginadas = this.transacciones.slice(inicio, fin);
  }

  irPaginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  irPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }
  cerrarCaja() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esto cerrará la caja y no podrás registrar más transacciones.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, cerrar caja',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      if (!this.detalleCaja?.idAperturaCaja) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo determinar el ID de la apertura de caja.'
        });
        return;
      }

      this.aperturaService.cerrarCaja(this.detalleCaja.idAperturaCaja).subscribe(
        () => {localStorage.removeItem('cajaActiva');

          Swal.fire({
            icon: 'success',
            title: 'Caja cerrada',
            text: 'La caja se cerró correctamente.'
          }).then(() => {
            this.router.navigate(['/admin/list-apertura']);
          });
        },
        (error) => {
          console.error('Error al cerrar la caja:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al cerrar la caja.'
          });
        }
      );
    }
  });
}


}
