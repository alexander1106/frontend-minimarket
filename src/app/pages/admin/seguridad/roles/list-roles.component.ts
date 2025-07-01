// src/app/pages/admin/seguridad/list-roles.component.ts
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { RolesService } from '../../../../service/roles.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-roles.component.html',
  styleUrls: ['./list-roles.component.css']
})
export class ListRolesComponent implements OnInit {
  roles: any[] = [];
  filtrados: any[] = [];
  filtro = '';
  mostrarModal = false;
  rol: any = { id: 0, nombre: '', estado: 1 };

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private svc: RolesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.svc.listarRoles().subscribe({
      next: data => { this.roles = data; this.aplicarFiltro(); },
      error: () => Swal.fire('Error', 'No se pudieron cargar roles', 'error')
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    let list = this.roles;
    if (t) {
      list = list.filter(r =>
        r.nombre.toLowerCase().includes(t) ||
        r.id.toString().includes(t)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    const count = this.filtro
      ? this.roles.filter(r => r.nombre.toLowerCase().includes(this.filtro.trim().toLowerCase())).length
      : this.roles.length;
    return Math.ceil(count / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.aplicarFiltro();
    }
  }

  abrirModal(r?: any): void {
    this.rol = r ? { ...r } : { id: 0, nombre: '', estado: 1 };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formSubmit(): void {
  const nombreTrim = (this.rol.nombre || '').trim();
  if (!nombreTrim) {
    Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    return;
  }

  // Construimos dos payloads: uno para crear (sin id) y otro para editar
  const crearPayload = {
    nombre: nombreTrim,
    estado: this.rol.estado ?? 1
  };

  const editarPayload = {
    id: this.rol.id!,            // aquí es seguro porque id>0
    nombre: nombreTrim,
    estado: this.rol.estado ?? 1
  };

  const pet$ = (this.rol.id && this.rol.id > 0)
    ? this.svc.editar(editarPayload)
    : this.svc.registrar(crearPayload);

  pet$.subscribe({
    next: () => {
      Swal.fire(
        'Éxito',
        (this.rol.id && this.rol.id > 0) ? 'Rol actualizado' : 'Rol registrado',
        'success'
      );
      this.cerrarModal();
      this.cargar();
    },
    error: (err: any) => {
      Swal.fire('Error', err.error?.message || 'Error inesperado', 'error');
    }
  });
}


  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar rol?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next: () => { Swal.fire('Eliminado', 'Rol eliminado', 'success'); this.cargar(); },
        error: (err: any) => Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error')
      });
    });
  }
}
