import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { PaginacionComponent } from '../../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../../components/paginacion/paginar.pipe';
import { ClientesService } from '../../../../../service/clientes.service';
import { LoginService } from '../../../../../service/login.service';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, HeaderComponent, RouterModule, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-clientes.component.html',
  styleUrl: './list-clientes.component.css'
})
export class ListClientesComponent implements OnInit {
  clientes: any[] = [];
  filtrados: any[] = [];
  filtroBusqueda = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  constructor(
    private clienteService: ClientesService,
    private router: Router,
    private dialog: MatDialog,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.listarClientes();

    const url = this.router.url;
    if (url.endsWith('/add-clientes')) this.abrirModalNuevoCliente();

    const matchEdit = url.match(/edit-clientes\/(\d+)/);
    if (matchEdit) this.abrirModalEditarClientePorId(Number(matchEdit[1]));

    const matchView = url.match(/view-clientes\/(\d+)/);
    if (matchView) this.abrirModalVerClientePorId(Number(matchView[1]));
  }

  listarClientes(): void {
    const idSucursal = this.loginService.getUser()?.sucursal?.idSucursal;
    if (!idSucursal) {
      this.cargando = false;
      Swal.fire('Error', 'No se encontró la sucursal del usuario', 'error');
      return;
    }

    this.cargando = true;
    this.clienteService.listarClientesPorSucursal(idSucursal).subscribe({
      next: (data: any) => {
        this.clientes = Array.isArray(data) ? data : [];
        this.cargando = false;
        this.buscarCliente();
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    });
  }

  buscarCliente(): void {
    const t = this.filtroBusqueda.trim().toLowerCase();
    this.filtrados = t
      ? this.clientes.filter(c =>
          [c.nombre, c.apellidos, c.documento, c.email, c.telefono]
            .some(v => String(v ?? '').toLowerCase().includes(t)))
      : [...this.clientes];
  }

  get conEmail(): number {
    return this.clientes.filter(c => (c.email || '').trim()).length;
  }

  nombreCompleto(c: any): string {
    return `${c.nombre || ''} ${c.apellidos || ''}`.trim();
  }

  iniciales(c: any): string {
    return this.nombreCompleto(c).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
  }

  navegarYMostrarModal(): void {
    this.router.navigate(['admin/add-clientes']);
  }

  navegarYEditarCliente(idCliente: number): void {
    this.router.navigate(['/admin/edit-clientes', idCliente]);
  }

  navegarYVerCliente(idCliente: number): void {
    this.router.navigate(['/admin/view-clientes', idCliente]);
  }

  private volverALaLista(): void {
    setTimeout(() => this.router.navigate(['/admin/list-clientes']), 0);
  }

  abrirModalNuevoCliente(): void {
    const dialogRef = this.dialog.open(AddClienteComponent, { width: '1200px', disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') this.listarClientes();
      this.volverALaLista();
    });
  }

  abrirModalEditarClientePorId(id: number): void {
    this.clienteService.buscarClienteId(id).subscribe({
      next: cliente => {
        const dialogRef = this.dialog.open(AddClienteComponent, {
          width: '1200px',
          disableClose: true,
          data: { cliente, modo: 'editar' }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'guardado') this.listarClientes();
          this.volverALaLista();
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el cliente', 'error');
        this.volverALaLista();
      }
    });
  }

  abrirModalVerClientePorId(id: number): void {
    this.clienteService.buscarClienteId(id).subscribe({
      next: cliente => {
        const dialogRef = this.dialog.open(AddClienteComponent, {
          width: '1200px',
          disableClose: true,
          data: { cliente, modo: 'ver' }
        });
        dialogRef.afterClosed().subscribe(() => this.volverALaLista());
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el cliente', 'error');
        this.volverALaLista();
      }
    });
  }

  eliminarCliente(id: number): void {
    Swal.fire({
      title: '¿Eliminar este cliente?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El cliente ha sido eliminado', 'success');
          this.listarClientes();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          const cuerpo = err.error;
          Swal.fire('Error', (typeof cuerpo === 'string' ? cuerpo : cuerpo?.message) || 'No se pudo eliminar el cliente', 'error');
        }
      });
    });
  }
}
