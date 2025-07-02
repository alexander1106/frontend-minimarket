import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ProveedoresService } from '../../../../../service/proveedores.service';
import { MatDialog } from '@angular/material/dialog';
import { AddProveedorComponent } from '../add-proveedor/add-proveedor.component';

@Component({
  selector: 'app-list-proveedores',
  standalone: true,
  imports: [HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-proveedores.component.html',
  styleUrl: './list-proveedores.component.css'
})
export class ListProveedoresComponent implements OnInit {
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private proveedorService: ProveedoresService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.proveedorService.buscarTodos().subscribe({
      next: (data: any) => {
        this.proveedores = data || [];
        this.buscarProveedor();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los proveedores", "error");
        console.error(err);
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
      disableClose: true
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
        modo: 'editar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.cargarProveedores();
      }
    });
  }

  eliminarProveedor(id: number) {
  // Verificación más robusta del ID
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
        next: (response) => {
          console.log('Respuesta del servidor:', response);
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
    return Array(this.totalPaginas).fill(0).map((x, i) => i + 1);
  }

  actualizarPaginaFiltrada() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.proveedores;
    if (filtro !== '') {
      coincidencias = this.proveedores.filter(p =>
        (p?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (p?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (p?.Id_Proveedor?.toString()?.includes(filtro) || false) 
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
        (p?.Id_Proveedor?.toString()?.includes(filtro) || false) 
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }
}