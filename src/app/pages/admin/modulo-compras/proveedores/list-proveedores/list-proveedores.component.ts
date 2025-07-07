import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { LoginService } from '../../../../../service/login.service'; // Asegúrate de importar el servicio de Login
import { MatDialog } from '@angular/material/dialog';
import { AddProveedorComponent } from '../add-proveedor/add-proveedor.component';

@Component({
  selector: 'app-list-proveedores',
  standalone: true,
  imports: [HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-proveedores.component.html',
  styleUrls: ['./list-proveedores.component.css']
})
export class ListProveedoresComponent implements OnInit {
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private proveedorService: ProveedoresService,
    private loginService: LoginService, // Inyecta el servicio de Login
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
  const empresa = this.loginService.getEmpresa();
  
  if (!empresa?.idempresa) {
    Swal.fire("Error", "Empresa no válida", "error");
    return;
  }

  this.proveedorService.buscarPorEmpresa(empresa.idempresa).subscribe({
    next: (response: any) => {
      console.log('Respuesta completa del backend:', response); // Para depuración
      
      // Ajuste clave aquí: La respuesta parece ser el array directo, no está dentro de 'body'
      if (response && response.length > 0) {
        this.proveedores = response;
        console.log('Proveedores cargados:', this.proveedores); // Verifica los datos
      } else {
        this.proveedores = [];
        Swal.fire("Info", "No hay proveedores registrados para esta empresa", "info");
      }
      this.buscarProveedor();
    },
    error: (err) => {
      console.error('Error completo:', err);
      let mensaje = 'Error al cargar proveedores';
      
      if (err.status === 404) {
        mensaje = 'No se encontraron proveedores para esta empresa';
      }
      
      Swal.fire("Error", mensaje, "error");
    }
  });
}

  buscarProveedor() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (p?.idProveedor?.toString()?.includes(filtro) || false)
      );
    }

    this.proveedoresFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  abrirModalNuevoProveedor() {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1200px',
      disableClose: true,
      data: {
        idEmpresa: this.loginService.getEmpresa()?.idempresa // Usamos la empresa del usuario
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.cargarProveedores();
      }
    });
  }

  abrirModalEditarProveedor(proveedor: any) {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1200px',
      disableClose: true,
      data: {
        proveedor,
        modo: 'editar',
        idEmpresa: this.loginService.getEmpresa()?.idempresa // Usamos la empresa del usuario
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.cargarProveedores();
      }
    });
  }

  eliminarProveedor(id: number) {
    if (id === undefined || id === null || isNaN(id)) {
      console.error('ID de proveedor no válido:', id);
      Swal.fire('Error', 'ID de proveedor no válido', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará al proveedor como inactivo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Eliminando/desactivando proveedor con ID:', id);
        this.proveedorService.eliminar(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Desactivado',
              text: 'El proveedor ha sido marcado como inactivo',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.cargarProveedores();
            });
          },
          error: (err) => {
            console.error('Error al eliminar proveedor:', err);
            Swal.fire(
              'Error',
              err.error?.message || 'No se pudo desactivar el proveedor',
              'error'
            );
          }
        });
      }
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaFiltrada();
    }
  }

  paginasArray(): number[] {
    return Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  actualizarPaginaFiltrada() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (p?.idProveedor?.toString()?.includes(filtro) || false)
      );
    }

    this.proveedoresFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (p?.idProveedor?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }
}
