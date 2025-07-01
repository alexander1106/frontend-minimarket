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

@Component({
  selector: 'app-list-apertura',
  standalone: true,
  imports: [
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

  paginaActual: number = 1;
  elementosPorPagina: number = 5;
  totalPaginas: number = 1;

  mostrarModal: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sucursalesService: SucursalesService,
    private cajasService: CajasService,
    private aperturaCajaService: AperturaCajaService,
    public loginService:LoginService

  ) {}

  ngOnInit(): void {
    this.listarSucursales();
    this.listarCajas();
    this.listarAperturas();
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
        console.error('Error al listar sucursales:', err);
      },
    });
  }

listarCajas() {
  this.cajasService.listarCaja().subscribe({
    next: (data) => {
      this.cajas = data || [];

      // Obtener rol y usuario
      const rolUsuario = this.loginService.getUserRole();
      const usuario = this.loginService.getUser();

      if (rolUsuario !== 'ADMIN' && usuario && usuario.sucursal && usuario.sucursal.idSucursal) {
        // Preseleccionar sucursal
        this.sucursalSeleccionada = usuario.sucursal.idSucursal;

        // Filtrar cajas de esa sucursal
        this.cajasDeSucursalSeleccionada = this.cajas.filter(
          (c) => Number(c.sucursales?.idSucursal) === Number(this.sucursalSeleccionada)
        );
      } else {
        // Si es admin o no hay sucursal, mostrar todas
        this.cajasDeSucursalSeleccionada = this.cajas;
      }

      // Al cargar, actualizar aperturas filtradas
      this.actualizarFiltradoAperturas(true);
    },
    error: (err) => {
      console.error('Error al listar cajas:', err);
    },
  });
}


  listarAperturas() {
    this.aperturaCajaService.listarAperturas().subscribe({
      next: (data) => {
        this.aperturas = data || [];
        this.actualizarFiltradoAperturas(true);
      },
      error: (err) => {
        console.error('Error al listar aperturas:', err);
      },
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
    this.actualizarFiltradoAperturas(true);
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
        (a) => (a.caja?.nombreCaja || '').toLowerCase().includes(term)
      );
    }

    this.totalPaginas = Math.max(
      1,
      Math.ceil(filtradas.length / this.elementosPorPagina)
    );

    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.aperturasFiltradas = filtradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarFiltradoAperturas(false);
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

abrirModalApertura() {
  if (this.cajaSeleccionadaFiltro == null) {
    alert('Por favor seleccione una caja antes de aperturar.');
    return;
  }

if (this.hayCajaAbierta()) {
  Swal.fire({
    icon: 'warning',
    title: 'Caja Abierta',
    text: 'No se puede aperturar otra caja. La caja seleccionada ya tiene una apertura activa. Cierre la apertura actual antes de abrir una nueva.',
    confirmButtonText: 'Entendido'
  });
  return;
}

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
    console.log('Ver apertura:', id);
  }

  editarApertura(id: number) {
    console.log('Editar apertura:', id);
  }

  eliminarApertura(id: number) {
    console.log('Eliminar apertura:', id);
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
}
