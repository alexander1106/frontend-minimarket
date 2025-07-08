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
import { SaldoMetodoPagoServiceService } from '../../../../../service/saldo-metodo-pago-service.service';
import { LoginService } from '../../../../../service/login.service';
import { ArqueoCajaServiceService } from '../../../../../service/arqueo-caja-service.service';

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
saldosMetodoPago: any[] = [];
mostrarFormularioArqueo = false;

// Campos del formulario de arqueo
montoContado: number = 0;
observacionesArqueo: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

 metodos: any[] = [];
  metodosFiltrados: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private aperturaService: AperturaCajaService,
    private CajasService: CajasService,
    private metodoPagoService: MetodoPagoService,
    private transaccionService: TransaccionesCajaService,
    private transaccionesEntreCajas:TranseferenciaEntreCajasService,
  private router: Router,
  private loginService:LoginService,
  private registrarArqueo:ArqueoCajaServiceService,
    private saldoMetodoPagoService: SaldoMetodoPagoServiceService, // 🚩 Nuevo servicio

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

          this.idCajaOrigen = idCaja; // preseleccionar caja origen

         this.CajasService.obtenerCajasAbiertasMismaSucursal(idCaja).subscribe(
          (cajasAbiertas: any[]) => {
            console.log('Cajas abiertas de la misma sucursal:', cajasAbiertas);
            this.cajas = cajasAbiertas;
          },
          (error) => {
            console.error('Error al obtener cajas abiertas:', error);
            this.cajas = [];
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

    // 🚩 NUEVO: Transacciones de esta apertura
    this.transaccionService.listarTransaccionesPorApertura(this.idAperturaCaja).subscribe(
      (data) => {
        this.transacciones = data;
        console.log('Transacciones de la apertura:', this.transacciones);
        this.actualizarPaginacion();
      },
      (error) => {
        console.error('Error al obtener transacciones:', error);
      }
    );
    // 🚩 NUEVO: Saldos de métodos de pago de esta apertura
    this.saldoMetodoPagoService.listarPorApertura(this.idAperturaCaja).subscribe(
      (data) => {
        this.saldosMetodoPago = data;
        console.log('Saldos de métodos de pago:', this.saldosMetodoPago);
      },
      (error) => {
        console.error('Error al obtener los saldos de métodos de pago:', error);
      }
    );

  } else {
    console.warn('No se encontró idAperturaCaja en la URL');
  }


  this.listarMetodosDeSucursal()
}

  // ✅ NUEVO MÉTODO PARA LISTAR POR SUCURSAL
  listarMetodosDeSucursal() {
    const user = this.loginService.getUser();
    if (!user || !user.sucursal || !user.sucursal.idSucursal) {
      Swal.fire("Error", "No se pudo determinar la sucursal del usuario.", "error");
      return;
    }

    const idSucursal = user.sucursal.idSucursal;

    this.metodoPagoService.listarMetodosPagoPorSucursal(idSucursal).subscribe({
      next: (data: any) => {
        this.metodos = data || [];
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los métodos de pago.", "error");
        console.error(err);
      }
    });
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
  if (!this.idMetodoPago) {
    Swal.fire({
      icon: 'warning',
      title: 'Método de Pago requerido',
      text: 'Debe seleccionar un método de pago antes de continuar.'
    });
    return;
  }

  // 🚩 Buscamos el saldo del método de pago seleccionado
  const saldoSeleccionado = this.saldosMetodoPago.find(
    (s) => s.metodoPago?.idMetodoPago === this.idMetodoPago
  );

  const saldoDisponible = saldoSeleccionado?.saldo ?? 0;


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

    // 🔵 Validamos si hay mensaje del backend
    const mensaje = error?.error;

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje ? mensaje : 'Ocurrió un error al guardar la transacción.'
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
onTipoMovimientoChange() {
  if (this.tipoMovimiento === 'EGRESO') {
    // Buscar método efectivo
    const metodoEfectivo = this.metodos.find(m => m.nombre?.toLowerCase() === 'efectivo');
    if (metodoEfectivo) {
      this.idMetodoPago = metodoEfectivo.idMetodoPago;
    }
  }
  // Opcional: limpiar si vuelve a ingreso
  // else {
  //   this.idMetodoPago = undefined;
  // }
}
  irPaginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

confirmarArqueo() {
  if (!this.detalleCaja?.idAperturaCaja) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo determinar el ID de la apertura de caja.'
    });
    return;
  }

  // 🚩 OBTENER saldo efectivo
  const saldoEfectivo = this.saldosMetodoPago.find(
    s => s.metodoPago?.nombre?.toLowerCase() === 'efectivo'
  )?.saldo ?? 0;

  // 🚩 COMPARAR monto contado con saldo efectivo
  if (this.montoContado !== saldoEfectivo) {
    const diferencia = this.montoContado - saldoEfectivo;
    Swal.fire({
      icon: 'warning',
      title: 'Diferencia detectada',
      html: `
        El monto contado <strong>S/ ${this.montoContado}</strong> no coincide con el saldo en efectivo <strong>S/ ${saldoEfectivo}</strong>.<br>
        Diferencia: <strong>S/ ${diferencia}</strong>
      `,
      confirmButtonText: 'Ok'
    });
    return; // 🚨 Detener el proceso
  }

  // 🚩 Si todo bien, enviar el arqueo
  const arqueo = {
    id_apertura_caja: this.detalleCaja.idAperturaCaja,
    fechaArqueo: new Date().toISOString(),
    saldoSistema: saldoEfectivo,
    observaciones: this.observacionesArqueo
  };

  // Aquí llamas al servicio de arqueo para registrar el arqueo
  this.registrarArqueo.registrarArqueo(arqueo).subscribe(
    () => {
      // Después del arqueo, cerrar la caja
      this.aperturaService.cerrarCaja(this.detalleCaja.idAperturaCaja).subscribe(
        () => {
          localStorage.removeItem('cajaActiva');
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
    },
    (error) => {
      console.error('Error al registrar arqueo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al registrar el arqueo.'
      });
    }
  );

  this.mostrarFormularioArqueo = false;
}

cancelarArqueo() {
  this.mostrarFormularioArqueo = false;
}

cerrarCaja() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esto iniciará el   arqueo de caja antes de cerrarla.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, iniciar arqueo',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Solo muestra el formulario de arqueo
      this.mostrarFormularioArqueo = true;
      this.mostrarFormularioTransaccion = false;
      this.mostrarFormularioTransferencia = false;
    }
  });
}
}
