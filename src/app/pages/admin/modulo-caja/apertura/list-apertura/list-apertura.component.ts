import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SucursalesService } from '../../../../../service/sucursales.service';
import { CajasService } from '../../../../../service/cajas.service';
import { AperturaCajaService } from '../../../../../service/apertura-caja.service';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { AddAperturaComponent } from '../add-apertura/add-apertura.component';
import Swal from 'sweetalert2';
import { LoginService } from '../../../../../service/login.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaginacionComponent } from '../../../../../components/paginacion/paginacion.component';

@Component({
  selector: 'app-list-apertura',
  standalone: true,
  imports: [PaginacionComponent, 
    FormsModule,
    CommonModule,
    BarraLateralComponent,
    HeaderComponent,
    AddAperturaComponent
  ],
  templateUrl: './list-apertura.component.html',
  styleUrl: './list-apertura.component.css'
})
export class ListAperturaComponent implements OnInit {
  filtroBusqueda: string = '';
  sucursalSeleccionada: number | undefined = undefined;
  cajaSeleccionadaFiltro: number | undefined = undefined;

  sucursales: any[] = [];
  cajas: any[] = [];
  cajasDeSucursalSeleccionada: any[] = [];

  aperturas: any[] = [];
  aperturasFiltradas: any[] = [];
aperturasGlobales: any[] = [];

  paginaActual: number = 1;
  elementosPorPagina: number = 5;
  totalFiltrado = 0;
  totalPaginas: number = 1;
mostrarModalDetalle: boolean = false;
detalleApertura: any = null;
transaccionesApertura: any[] = [];
  mostrarModal: boolean = false;
  private cajaPorDefectoAplicada = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sucursalesService: SucursalesService,
    private cajasService: CajasService,
    private aperturaCajaService: AperturaCajaService,
    public loginService: LoginService
  ) {}

 ngOnInit(): void {
  const cajaActivaRaw = localStorage.getItem('cajaActiva');
  if (cajaActivaRaw) {
    try {
      const cajaActiva = JSON.parse(cajaActivaRaw);
      if (cajaActiva?.idCaja) {
        this.cajaSeleccionadaFiltro = Number(cajaActiva.idCaja);
      }
    } catch (e) {
    }
  }

  this.listarSucursales();
  this.listarCajas();
}

  listarSucursales() {
    this.sucursalesService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data || [];
        this.cajas = [];
        this.sucursales.forEach((sucursal) => {
          if (sucursal.cajas) {
            sucursal.cajas.forEach((caja: any) => {
              caja.sucursal = {
                idSucursal: sucursal.idSucursal,
                nombreSucursal: sucursal.nombreSucursal
              };
              this.cajas.push(caja);
            });
          }
        });
      },
      error: (err) => {
      },
    });
  }
tieneAperturaAbiertaPorUsuario(): boolean {
  const usuarioActual = this.loginService.getUser();

  if (!usuarioActual || !usuarioActual.idUsuario) {
    return false;
  }

  return this.aperturasGlobales.some(
    (a) =>
      Number(a.usuarios?.idUsuario) === Number(usuarioActual.idUsuario) &&
      (a.estadoCaja || '').toLowerCase() === 'abierta'
  );
}

listarCajas() {
  this.cajasService.listarCaja().subscribe({
    next: (data) => {
      this.cajas = data || [];

      const rolUsuario = this.loginService.getUserRole();
      const usuario = this.loginService.getUser();

      if (rolUsuario !== 'ADMIN' && usuario && usuario.sucursal && usuario.sucursal.idSucursal) {
        this.sucursalSeleccionada = usuario.sucursal.idSucursal;

        this.cajasDeSucursalSeleccionada = this.cajas.filter(
          (c) => Number(c.sucursales?.idSucursal) === Number(this.sucursalSeleccionada)
        );

        this.listarAperturas();
      } else {
        this.cajasDeSucursalSeleccionada = this.cajas;

        this.listarAperturas();
      }

      this.actualizarFiltradoAperturas(true);
    },
    error: (err) => {
    },
  });
}
listarAperturas() {
  this.aperturaCajaService.listarAperturas().subscribe({
    next: (data) => {
      this.aperturasGlobales = data || [];

      this.aplicarSucursal();
      this.seleccionarCajaAbierta();
      this.actualizarFiltradoAperturas(true);
    },
    error: (err) => {
    },
  });
}
exportarPDF(idAperturaCaja: number) {
  Swal.fire({
    title: 'Generando PDF...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.aperturaCajaService.obtenerTransaccionesPorApertura(idAperturaCaja).subscribe({
    next: (transacciones) => {
      Swal.close();

      const apertura = this.aperturasGlobales.find(
        (a) => Number(a.idAperturaCaja) === Number(idAperturaCaja)
      );

      if (!apertura) {
        Swal.fire('Error', 'No se encontró la información de la apertura.', 'error');
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('Reporte de Apertura de Caja', 14, 20);

      doc.setFontSize(12);
      doc.text(`Apertura ID: ${apertura.idAperturaCaja}`, 14, 30);
      doc.text(`Caja: ${apertura.caja?.nombreCaja || ''}`, 14, 38);
      doc.text(`Sucursal: ${apertura.caja?.sucursales?.nombreSucursal || ''}`, 14, 46);
      doc.text(`Usuario: ${apertura.usuarios?.username || ''}`, 14, 54);
      doc.text(`Estado: ${apertura.estadoCaja || ''}`, 14, 62);
      doc.text(`Fecha de Apertura: ${apertura.fechaApertura || ''}`, 14, 70);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 78);

      if (!transacciones || transacciones.length === 0) {
        doc.setFontSize(12);
        doc.text('Esta apertura no tiene transacciones registradas.', 14, 90);
        doc.save(`apertura_${idAperturaCaja}.pdf`);
        return;
      }

      const body = transacciones.map((t: any, index: number) => [
        index + 1,
        t.fecha || '',
        t.tipoMovimiento || '',
        t.monto || 0,
        t.observaciones || '',
        t.aperturaCaja?.usuarios?.username || ''
      ]);

      autoTable(doc, {
        head: [['#', 'Fecha', 'Tipo', 'Monto', 'Descripción', 'Usuario']],
        body: body,
        startY: 88
      });

      doc.save(`apertura_${idAperturaCaja}.pdf`);
    },
    error: (error) => {
      Swal.close();
      Swal.fire('Error', 'No se pudieron obtener las transacciones.', 'error');
    }
  });
}

onSucursalChange() {
  this.cajaSeleccionadaFiltro = undefined;

  if (this.sucursalSeleccionada != null) {
    this.cajasDeSucursalSeleccionada = this.cajas.filter(
      (c) => Number(c.sucursales?.idSucursal) === Number(this.sucursalSeleccionada)
    );
  } else {
    this.cajasDeSucursalSeleccionada = this.cajas;
  }

  this.aplicarSucursal();
  this.actualizarFiltradoAperturas(true);
}

  private aplicarSucursal() {
    this.aperturas = this.sucursalSeleccionada == null
      ? [...this.aperturasGlobales]
      : this.aperturasGlobales.filter(
          (a) => Number(a.caja?.sucursales?.idSucursal) === Number(this.sucursalSeleccionada)
        );
  }

  private seleccionarCajaAbierta() {
    if (this.cajaPorDefectoAplicada) return;
    this.cajaPorDefectoAplicada = true;

    const abiertas = this.aperturas.filter((a) => this.esAbierta(a));
    const idUsuario = Number(this.loginService.getUser()?.idUsuario);
    const elegida =
      abiertas.find((a) => Number(a.usuarios?.idUsuario) === idUsuario) ||
      abiertas.find((a) => Number(a.caja?.idCaja) === Number(this.cajaSeleccionadaFiltro)) ||
      abiertas[0];

    if (!elegida?.caja?.idCaja) return;
    this.cajaSeleccionadaFiltro = Number(elegida.caja.idCaja);
    const idSucursal = elegida.caja.sucursales?.idSucursal;
    if (this.sucursalSeleccionada == null && idSucursal != null) {
      this.sucursalSeleccionada = Number(idSucursal);
      this.cajasDeSucursalSeleccionada = this.cajas.filter(
        (c) => Number(c.sucursales?.idSucursal) === Number(idSucursal)
      );
      this.aplicarSucursal();
    }
  }

  actualizarFiltradoAperturas(resetPagina: boolean = true) {
    if (resetPagina) {
      this.paginaActual = 1;
    }

    let filtradas = this.aperturas;

    if (this.cajaSeleccionadaFiltro != null) {
      filtradas = filtradas.filter(
        (a) => Number(a.caja?.idCaja) === Number(this.cajaSeleccionadaFiltro)
      );
    }

    if (this.filtroBusqueda.trim() !== '') {
      const term = this.filtroBusqueda.toLowerCase();
      filtradas = filtradas.filter(
        (a) => (a.caja?.nombreCaja || '').toLowerCase().includes(term) || (a.usuarios?.username || '').toLowerCase().includes(term)
      );
    }

    this.totalFiltrado = filtradas.length;
    this.totalPaginas = Math.max(
      1,
      Math.ceil(filtradas.length / this.elementosPorPagina)
    );
    if (this.paginaActual > this.totalPaginas) this.paginaActual = this.totalPaginas;

    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.aperturasFiltradas = filtradas.slice(inicio, fin);
  }

  esAbierta(a: any): boolean {
    return String(a?.estadoCaja || '').toLowerCase() === 'abierta';
  }

  get abiertas(): number {
    return this.aperturas.filter(a => this.esAbierta(a)).length;
  }

  get saldoAbiertas(): number {
    return this.aperturas.filter(a => this.esAbierta(a)).reduce((s, a) => s + Number(a.saldoInicial || 0), 0);
  }

  cambiarFilas(n: number) {
    this.elementosPorPagina = n;
    this.actualizarFiltradoAperturas(true);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarFiltradoAperturas(false);
  }

  abrirModalApertura() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  onAperturaGuardada(nuevaApertura: any) {
    this.mostrarModal = false;
    this.listarAperturas();
  }

verApertura(id: number) {
  Swal.fire({
    title: 'Cargando información...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.aperturaCajaService.buscarAperturaId(id).subscribe({
    next: (apertura) => {
      this.aperturaCajaService.obtenerTransaccionesPorApertura(id).subscribe({
        next: (transacciones) => {
          Swal.close();
          this.detalleApertura = apertura;
          this.transaccionesApertura = transacciones;
          this.mostrarModalDetalle = true;
        },
        error: (err) => {
          Swal.close();
          Swal.fire('Error', 'No se pudieron cargar las transacciones.', 'error');
        }
      });
    },
    error: (err) => {
      Swal.close();
      Swal.fire('Error', 'No se pudo cargar la apertura.', 'error');
    }
  });
}

  irATransacciones(idAperturaCaja: number) {
    this.router.navigate(['/admin/list-transacciones', idAperturaCaja]);
  }

  hayCajaAbierta(): boolean {
    if (!this.cajaSeleccionadaFiltro) {
      return false;
    }

    return this.aperturas.some(
      (a) =>
        Number(a.caja?.idCaja) === Number(this.cajaSeleccionadaFiltro) &&
        (a.estadoCaja || '').toLowerCase() === 'abierta'
    );
  }
puedeVerTransacciones(apertura: any): boolean {
  const usuario = this.loginService.getUser();
  const rol = this.loginService.getUserRole();

  if (rol === 'ADMIN') {
    return true;
  }

  return (
    usuario &&
    Number(apertura.usuarios?.idUsuario) === Number(usuario.idUsuario) &&
    (apertura.estadoCaja || '').toLowerCase() === 'abierta'
  );
}

}
