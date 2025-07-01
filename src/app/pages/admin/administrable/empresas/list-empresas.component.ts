import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { EmpresasService } from '../../../../service/empresas.service';

interface Empresa {
  idempresa: number;
  razonsocial: string;
  ciudad: string;
  direccion: string;
  ruc: string;
  correo: string;
  cant_sucursales?: number;
  cant_cajas?: number;
  cant_trabajadores?: number;
  limit_inventario?: number;
  fechaRegistro?: string;
  estado: number;
  logoBase64?: string;
}

@Component({
  selector: 'app-list-empresas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent
  ],
  templateUrl: './list-empresas.component.html',
  styleUrls: ['./list-empresas.component.css']
})
export class ListEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  filtrados: Empresa[] = [];
  filtro = '';
  mostrarModal = false;

  empresa: Empresa = {
    idempresa: 0,
    razonsocial: '',
    ciudad: '',
    direccion: '',
    ruc: '',
    correo: '',
    estado: 1
  };

  // para manejar el logo
  selectedFile: File | null = null;

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private svc: EmpresasService) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  private cargarEmpresas(): void {
    this.svc.listarEmpresas().subscribe({
      next: data => {
        this.empresas = data.map((e: any) => ({
          idempresa:       e.idempresa,
          razonsocial:     e.razonsocial,
          ciudad:          e.ciudad,
          direccion:       e.direccion,
          ruc:             e.ruc,
          correo:          e.correo,
          cant_sucursales: e.cant_sucursales,
          cant_cajas:      e.cant_cajas,
          cant_trabajadores:e.cant_trabajadores,
          limit_inventario:e.limit_inventario,
          fechaRegistro:   e.fechaRegistro,
          estado:          e.estado,
          logoBase64:      e.logo
          ? `data:image/png;base64,${e.logo}`
          : null
      } as any));
      this.aplicarFiltro();
      },
      error: () =>
        Swal.fire('Error', 'No se pudieron cargar las empresas', 'error')
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    let list = this.empresas;
    if (t) {
      list = list.filter(e =>
        e.razonsocial.toLowerCase().includes(t) ||
        e.ciudad.toLowerCase().includes(t) ||
        e.ruc.toLowerCase().includes(t)
      );
    }
    const start = (this.paginaActual - 1) * this.elementosPorPagina;
    this.filtrados = list.slice(start, start + this.elementosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.empresas.length / this.elementosPorPagina);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number): void {
    this.paginaActual = p;
    this.aplicarFiltro();
  }

  abrirModal(e?: Empresa): void {
    if (e) {
      this.empresa = { ...e };
    } else {
      this.empresa = {
        idempresa: 0,
        razonsocial: '',
        ciudad: '',
        direccion: '',
        ruc: '',
        correo: '',
        estado: 1
      };
    }
    this.selectedFile = null;    // limpiar logo previo
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  /** Captura el archivo logo */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  formSubmit(): void {
    // validaciones
    if (!this.empresa.razonsocial.trim()) {
      Swal.fire('Atención', 'La razón social es obligatoria', 'warning');
      return;
    }
    if (!/^\d{11}$/.test(this.empresa.ruc)) {
      Swal.fire('Atención', 'El RUC debe tener 11 dígitos', 'warning');
      return;
    }
    if (!this.empresa.correo.trim()) {
      Swal.fire('Atención', 'El correo es obligatorio', 'warning');
      return;
    }

    // fecha en ISO YYYY-MM-DD
    let isoDate = this.empresa.fechaRegistro
      ? this.empresa.fechaRegistro
      : new Date().toISOString().substring(0,10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      isoDate = new Date().toISOString().substring(0,10);
    }

    // construimos FormData
    const formData = new FormData();

    formData.append('razonsocial',      this.empresa.razonsocial);
    formData.append('ciudad',           this.empresa.ciudad);
    formData.append('direccion',        this.empresa.direccion);
    formData.append('ruc',              this.empresa.ruc);
    formData.append('correo',           this.empresa.correo);
    formData.append('cant_sucursales',  String(this.empresa.cant_sucursales ?? 0));
    formData.append('cant_cajas',       String(this.empresa.cant_cajas    ?? 0));
    formData.append('cant_trabajadores',String(this.empresa.cant_trabajadores ?? 0));
    formData.append('limit_inventario', String(this.empresa.limit_inventario  ?? 0));
    formData.append('fechaRegistro',     isoDate);
    formData.append('estado',            String(this.empresa.estado));

    // si hay logo, lo añadimos
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile, this.selectedFile.name);
    }

    // elegimos método con o sin logo
    const pet$ = this.empresa.idempresa > 0
      ? this.svc.editar(formData)
      : this.svc.registrar(formData);

    pet$.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Guardado correctamente', 'success');
        this.cerrarModal();
        this.cargarEmpresas();
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Ha ocurrido un error', 'error');
      }
    });
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Eliminar empresa?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Empresa eliminada', 'success');
          this.cargarEmpresas();
        },
        error: err => Swal.fire('Atención', err.error?.message ?? 'Error', 'warning')
      });
    });
  }
}
