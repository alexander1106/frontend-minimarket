import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { AddCajaComponent } from '../add-caja/add-caja.component';
import { SucursalesService } from '../../../../../service/sucursales.service';
import { CajasService } from '../../../../../service/cajas.service';
import Swal from 'sweetalert2';
import { LoginService } from '../../../../../service/login.service';

@Component({
  selector: 'app-list-caja',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    CommonModule,
    BarraLateralComponent,
    HeaderComponent,
    AddCajaComponent
  ],
  templateUrl: './list-caja.component.html',
  styleUrls: ['./list-caja.component.css'],
})
export class ListCajaComponent implements OnInit {
  filtroBusqueda: string = '';
  sucursalSeleccionada: number | undefined = undefined;

  sucursales: any[] = [];
  cajas: any[] = [];
  cajasFiltradas: any[] = [];

  paginaActual: number = 1;
  elementosPorPagina: number = 5;
  totalPaginas: number = 1;

  modalAbierto = false;
  cajaSeleccionada: any = null;
  rolUsuario: any;
  idSucursalUsuario: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sucursalesService: SucursalesService,
    private cajasService: CajasService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.loginService.getRol();
    const usuario = this.loginService.getUser();
    this.idSucursalUsuario = usuario?.sucursal?.idSucursal ?? null;

    if (this.rolUsuario !== 'ADMIN' && this.idSucursalUsuario) {
      this.sucursalSeleccionada = this.idSucursalUsuario;
    }


    this.listarSucursales();
    this.cargarCajas();
  }

  listarSucursales() {
    this.sucursalesService.listarSucursales().subscribe({
      next: (data) => {
        this.sucursales = data || [];
      },
      error: (err) => {
        console.error('Error al listar sucursales:', err);
      },
    });
  }

  cargarCajas() {
    if (this.sucursalSeleccionada != null) {
      // Si hay una sucursal seleccionada, traer solo sus cajas
      this.sucursalesService.listarCajasPorSucursal(this.sucursalSeleccionada).subscribe({
        next: (data: any) => {
          this.cajas = data || [];
          this.actualizarFiltradoYPagina();
        },
        error: (err) => {
          console.error('Error al listar cajas por sucursal:', err);
        },
      });
    } else {
      // Si no hay sucursal seleccionada, traer todas las cajas
      this.cajasService.listarCaja().subscribe({
        next: (data: any) => {
          this.cajas = data || [];
          this.actualizarFiltradoYPagina();
        },
        error: (err) => {
          console.error('Error al listar todas las cajas:', err);
        },
      });
    }
  }

  actualizarFiltradoYPagina() {
    this.paginaActual = 1;

    let listaFiltrada = this.cajas;

    if (this.filtroBusqueda.trim() !== '') {
      const term = this.filtroBusqueda.toLowerCase();
      listaFiltrada = listaFiltrada.filter((c) =>
        (c.nombreCaja || '').toLowerCase().includes(term)
      );
    }

    this.totalPaginas = Math.max(
      1,
      Math.ceil(listaFiltrada.length / this.elementosPorPagina)
    );

    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.cajasFiltradas = listaFiltrada.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarFiltradoYPagina();
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  crearCaja() {
    const sucursalPreseleccionada = this.sucursales.find(
      s => s.idSucursal === this.sucursalSeleccionada
    );
    this.cajaSeleccionada = {
      nombreCaja: '',
      sucursal: sucursalPreseleccionada ?? null,
      saldoActual: 0,
      estadoCaja: 'ACTIVA'
    };
    this.modalAbierto = true;
  }

  editarCaja(id: number) {
    const encontrada = this.cajas.find(c => c.idCaja === id);
    if (encontrada) {
      this.cajaSeleccionada = { ...encontrada };
      this.modalAbierto = true;
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  onCajaGuardada() {
    this.modalAbierto = false;
    this.cargarCajas(); // Refresca las cajas al guardar
  }

  verCaja(id: number) {
    console.log('Ver caja:', id);
  }

  eliminarCaja(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la caja de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cajasService.eliminarCaja(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La caja se eliminó correctamente.', 'success').then(() => {
              this.cargarCajas();
            });
          },
          error: (err) => {
            if (err.status === 400 || err.status === 409) {
              Swal.fire('No permitido', err.error, 'warning');
            } else {
              Swal.fire('Error', 'Ocurrió un error al eliminar la caja.', 'error');
            }
          }
        });
      }
    });
  }
}
