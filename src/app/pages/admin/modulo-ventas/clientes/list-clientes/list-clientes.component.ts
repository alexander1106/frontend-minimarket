
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../../../../components/header/header.component';
import { BarraLateralComponent } from '../../../../../components/barra-lateral/barra-lateral.component';
import { ClientesService } from '../../../../../service/clientes.service';
import { MatDialog } from '@angular/material/dialog';
import { AddClienteComponent } from '../add-cliente/add-cliente.component';

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [HeaderComponent, BarraLateralComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './list-clientes.component.html',
  styleUrl: './list-clientes.component.css'
})
export class ListClientesComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  filtroBusqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 5;

  constructor(
    private clienteService: ClientesService,
    private router: Router,
    private dialog: MatDialog
  ) {}
ngOnInit() {
  this.listarClientes();

  const url = this.router.url;

  // Modal de agregar
  if (url.endsWith('/add-clientes')) {
    this.abrirModalNuevoCliente();
  }

  // Modal de editar
  const matchEdit = url.match(/edit-clientes\/(\d+)/);
  if (matchEdit) {
    const idCliente = Number(matchEdit[1]);
    this.abrirModalEditarClientePorId(idCliente);
  }

  // Modal de ver
  const matchView = url.match(/view-clientes\/(\d+)/);
  if (matchView) {
    const idCliente = Number(matchView[1]);
    this.abrirModalVerClientePorId(idCliente);
  }
}
navegarYVerCliente(idCliente: number) {
  this.router.navigate(['/admin/view-clientes', idCliente]);
}

abrirModalVerClientePorId(id: number) {
  this.clienteService.buscarClienteId(id).subscribe({
    next: (cliente) => {
      const dialogRef = this.dialog.open(AddClienteComponent, {
        width: '1200px',
        disableClose: true,
        data: { cliente, modo: 'ver' }
      });

      dialogRef.afterClosed().subscribe(() => {
        // Al cerrar, volver a la lista
        setTimeout(() => {
          this.router.navigate(['/admin/list-clientes']);
        }, 0);
      });
    },
    error: () => {
      Swal.fire('Error', 'No se pudo cargar el cliente', 'error');
      this.router.navigate(['/admin/list-clientes']);
    }
  });
}
abrirModalEditarClientePorId(id: number) {
  this.clienteService.buscarClienteId(id).subscribe({
    next: (cliente) => {
      const dialogRef = this.dialog.open(AddClienteComponent, {
        width: '1200px',
        disableClose: true,
        data: {
          cliente,
          modo: 'editar'   // 🔴 Aquí le indicas que es modo edición
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'guardado') {
          this.listarClientes();
        }

        setTimeout(() => {
          this.router.navigate(['/admin/list-clientes']);
        }, 0);
      });
    },
    error: () => {
      Swal.fire('Error', 'No se pudo cargar el cliente', 'error');
      this.router.navigate(['/admin/list-clientes']);
    }
  });
}
navegarYEditarCliente(idCliente: number) {
  this.router.navigate(['/admin/edit-clientes', idCliente]);
}

  abrirModalNuevoCliente() {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '1200px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'guardado') {
        this.listarClientes();
      }

      // Asegura que el modal se cierre completamente antes de redirigir
      setTimeout(() => {
        this.router.navigate(['/admin/list-clientes']);
      }, 0);
    });
  }

eliminarCliente(id: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará al cliente permanentemente',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Eliminado',
            text: 'El cliente ha sido eliminado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.reload(); // ✅ recarga la página completamente
          });
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
          console.error(err);
        }
      });
    }
  });
}


  listarClientes() {
    this.clienteService.listarClientes().subscribe({
      next: (data: any) => {
        this.clientes = data || [];
        this.buscarCliente();
      },
      error: (err) => {
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
        console.error(err);
      }
    });
  }

  buscarCliente() {
    const filtro = this.filtroBusqueda.trim().toLowerCase();
    this.paginaActual = 1;

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.ruc?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_cliente?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
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

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    this.clientesFiltrados = coincidencias.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  get totalPaginas(): number {
    const filtro = this.filtroBusqueda.trim().toLowerCase();

    let coincidencias = this.clientes;
    if (filtro !== '') {
      coincidencias = this.clientes.filter(m =>
        (m?.nombre?.toLowerCase()?.includes(filtro) || false) ||
        (m?.descripcion?.toLowerCase()?.includes(filtro) || false) ||
        (m?.id_metodo?.toString()?.includes(filtro) || false)
      );
    }

    return Math.ceil(coincidencias.length / this.elementosPorPagina);
  }

abrirModalEditarCliente(cliente: any) {
  const dialogRef = this.dialog.open(AddClienteComponent, {
    width: '1200px',
    disableClose: true,
    data: { cliente }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'guardado') {
      this.listarClientes();
    }
  });
}

  navegarYMostrarModal() {
    this.router.navigate(['admin/add-clientes']);
  }
}
