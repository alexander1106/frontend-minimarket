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
    this.listarProveedores();

    const url = this.router.url;

    // Modal de agregar
    if (url.endsWith('/add-proveedores')) {
      this.abrirModalNuevoProveedor();
    }

    // Modal de editar
    const matchEdit = url.match(/edit-proveedores\/(\d+)/);
    if (matchEdit) {
      const idProveedor = Number(matchEdit[1]);
      this.abrirModalEditarProveedorPorId(idProveedor);
    }

    // Modal de ver
    const matchView = url.match(/view-proveedores\/(\d+)/);
    if (matchView) {
      const idProveedor = Number(matchView[1]);
      this.abrirModalVerProveedorPorId(idProveedor);
    }
  }

  navegarYVerProveedor(idProveedor: number) {
    this.router.navigate(['/admin/view-proveedores', idProveedor]);
  }

  abrirModalVerProveedorPorId(id: number) {
    this.proveedorService.buscarId(id).subscribe({
      next: (proveedor) => {
        const dialogRef = this.dialog.open(AddProveedorComponent, {
          width: '1200px',
          disableClose: true,
          data: { proveedor, modo: 'ver' }
        });

        dialogRef.afterClosed().subscribe(() => {
          setTimeout(() => {
            this.router.navigate(['/admin/list-proveedores']);
          }, 0);
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el proveedor', 'error');
        this.router.navigate(['/admin/list-proveedores']);
      }
    });
  }

  abrirModalEditarProveedorPorId(id: number) {
    this.proveedorService.buscarId(id).subscribe({
      next: (proveedor) => {
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
            this.listarProveedores();
          }

          setTimeout(() => {
            this.router.navigate(['/admin/list-proveedores']);
          }, 0);
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el proveedor', 'error');
        this.router.navigate(['/admin/list-proveedores']);
      }
    });
  }

  navegarYEditarProveedor(idProveedor: number) {
    this.router.navigate(['/admin/edit-proveedores', idProveedor]);
  }

  abrirModalNuevoProveedor() {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1200px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.listarProveedores();
      }

      setTimeout(() => {
        this.router.navigate(['/admin/list-proveedores']);
      }, 0);
    });
  }

  eliminarProveedor(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al proveedor permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedorService.eliminar(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El proveedor ha sido eliminado',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  listarProveedores() {
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
        (p?.nombre?.toLowerCase()?.includes(filtro) || false)||
        (p?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (p?.id_proveedor?.toString()?.includes(filtro) || false) ||
        (p?.telefono?.toString()?.includes(filtro) || false) ||
        (p?.gmail?.toLowerCase()?.includes(filtro) || false) ||
        (p?.direccion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    this.proveedoresFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
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
        (p?.ruc?.toString()?.includes(filtro) || false) ||
        (p?.id_proveedor?.toString()?.includes(filtro) || false) ||
        (p?.telefono?.toString()?.includes(filtro) || false) ||
        (p?.gmail?.toLowerCase()?.includes(filtro) || false) ||
        (p?.direccion?.toLowerCase()?.includes(filtro) || false)
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
        (p?.ruc?.toString()?.includes(filtro) || false) ||
        (p?.id_proveedor?.toString()?.includes(filtro) || false) ||
        (p?.telefono?.toString()?.includes(filtro) || false) ||
        (p?.gmail?.toLowerCase()?.includes(filtro) || false) ||
        (p?.direccion?.toLowerCase()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

  abrirModalEditarProveedor(proveedor: any) {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1200px',
      disableClose: true,
      data: { proveedor }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.listarProveedores();
      }
    });
  }

  navegarYMostrarModal() {
    this.router.navigate(['admin/add-proveedores']);
  }
}