import { Component, OnInit } from '@angular/core';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { PagosService } from '../../../../service/pagos.service';
import { CotizacionService } from '../../../../service/cotizacion.service';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../../service/login.service';
import { MetodoPagoService } from '../../../../service/metodo-pago.service';

@Component({
  selector: 'app-list-pagos',
  imports: [BarraLateralComponent,FormsModule, HeaderComponent, CommonModule, RouterModule],
  templateUrl: './list-pagos.component.html',
  styleUrl: './list-pagos.component.css'
})
export class ListPagosComponent implements OnInit {
  pagos: any[] = [];
  cotizaciones: any[] = [];
metodosPago: any[] = [];
  mostrandoFormulario = false;
  nuevoPago: any = {
    cotizacionId: null,
    observaciones: '',
    fechaPago: '',
    montoPagado: null,
    estadoPago: 'Realizado',
      metodoPagoId: null

  };

  constructor(
    private pagosService: PagosService,
    private cotizacionesService: CotizacionService,
    private router: Router,
    private route: ActivatedRoute,
    private loginService:LoginService,
    private metodosPagoService:MetodoPagoService
  ) {}

  ngOnInit(): void {
    this.listarPagos();
    this.listarCotizaciones();
    this.listarMetodosPago()
  }
listarMetodosPago() {
  const usuario = this.loginService.getUser();
  const sucursalId = usuario.sucursal?.idSucursal || 1;

  this.metodosPagoService.listarMetodosPagoPorSucursal(sucursalId).subscribe({
    next: (data) => {
      console.log("Métodos de pago cargados:", data);
      this.metodosPago = data || [];
    },
    error: (err) => {
      Swal.fire("Error", "No se pudieron cargar los métodos de pago", "error");
      console.error(err);
    }
  });
}

  listarPagos() {
    this.pagosService.listarPagos().subscribe({
      next: (data: any) => {
        this.pagos = data || [];
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los pagos", "error");
        console.error(err);
      }
    });
  }
listarCotizaciones() {
  const usuario = this.loginService.getUser();
  const sucursalId = usuario.sucursal?.idSucursal || 1;

  this.cotizacionesService.listarCotizacionesPorSucursal(sucursalId).subscribe({
    next: (data) => {
      // Filtrar las cotizaciones pendientes
      this.cotizaciones = (data || []).filter((c: { estadoCotizacion: string; }) => c.estadoCotizacion === 'PENDIENTE');
    },
    error: (err) => {
      Swal.fire("Error", "No se pudieron cargar las cotizaciones", "error");
      console.error(err);
    }
  });
}



  mostrarFormularioPago() {
    this.mostrandoFormulario = true;
  }


onCotizacionSeleccionada(cotizacionId: any) {
  console.log('Seleccionaste cotización:', cotizacionId);
  this.nuevoPago.cotizacionId = cotizacionId;

  const cotizacion = this.cotizaciones.find(c => c.idCotizaciones == cotizacionId);

  if (cotizacion) {
    console.log('Cotización encontrada:', cotizacion);
    this.nuevoPago.montoPagado = cotizacion.totalCotizacion || 0;
        this.nuevoPago.observaciones = "Pago por cotizacion";

  } else {
    console.log('No se encontró la cotización.');
    this.nuevoPago.montoPagado = null;
  }
}

guardarPago() {
  const dto = {
    id_venta: this.nuevoPago.cotizacionId,
    id_metodo_pago: this.nuevoPago.metodoPagoId,
    observaciones: this.nuevoPago.observaciones,
    fechaPago: this.nuevoPago.fechaPago,
    montoPagado: this.nuevoPago.montoPagado,
    estadoPago: this.nuevoPago.estadoPago
  };

  this.pagosService.registrarPago(dto).subscribe({
    next: () => {
      Swal.fire("Éxito", "Pago registrado correctamente", "success");
      this.listarPagos();
      this.mostrandoFormulario = false;
      this.nuevoPago = {
        cotizacionId: null,
        observaciones: '',
        fechaPago: '',
        montoPagado: null,
        estadoPago: 'Relizado',
        metodoPagoId: null
      };
    },
    error: (err) => {
      Swal.fire("Error", "No se pudo registrar el pago", "error");
      console.error(err);
    }
  });
}

}
