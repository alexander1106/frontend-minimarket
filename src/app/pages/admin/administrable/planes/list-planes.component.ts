import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';
import { Plan, PlanPayload, PlanesService } from '../../../../service/planes.service';

interface FormPlan {
  idPlan: number;
  nombre: string;
  precioMensual: number | null;
  maxUsuarios: number | null;
  maxSucursales: number | null;
  activo: boolean;
}

@Component({
  selector: 'app-list-planes',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent, PaginarPipe],
  templateUrl: './list-planes.component.html',
  styleUrls: ['./list-planes.component.css']
})
export class ListPlanesComponent implements OnInit {
  planes: Plan[] = [];
  filtrados: Plan[] = [];
  filtro = '';
  cargando = true;

  pagina = 1;
  porPagina = 5;

  mostrarModal = false;
  guardando = false;
  form: FormPlan = this.formVacio();
  empresasDelPlan = 0;
  errores: Record<string, string> = {};
  aviso = '';

  constructor(private svc: PlanesService) {}

  ngOnInit(): void {
    this.cargar();
  }

  private formVacio(): FormPlan {
    return { idPlan: 0, nombre: '', precioMensual: null, maxUsuarios: null, maxSucursales: null, activo: true };
  }

  cargar(): void {
    this.cargando = true;
    this.svc.listar().subscribe({
      next: data => {
        this.planes = (Array.isArray(data) ? data : []).sort((a, b) => a.precioMensual - b.precioMensual);
        this.cargando = false;
        this.aplicarFiltro();
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudieron cargar los planes', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t ? this.planes.filter(p => p.nombre.toLowerCase().includes(t)) : [...this.planes];
  }

  get activos(): number {
    return this.planes.filter(p => p.estado === 1).length;
  }

  get empresasSuscritas(): number {
    return this.planes.reduce((s, p) => s + Number(p.totalEmpresas || 0), 0);
  }

  limite(n: number | null): string {
    return n == null ? 'Ilimitado' : String(n);
  }

  motivoNoDesactivar(p: Plan): string {
    if (p.estado !== 1) return 'El plan ya está desactivado';
    if (p.totalEmpresas > 0) {
      return `${p.totalEmpresas} ${p.totalEmpresas === 1 ? 'empresa usa' : 'empresas usan'} este plan. Cámbiales el plan primero.`;
    }
    return 'Desactivar';
  }

  puedeDesactivar(p: Plan): boolean {
    return p.estado === 1 && !(p.totalEmpresas > 0);
  }

  abrirModal(p?: Plan): void {
    this.errores = {};
    this.aviso = '';
    this.empresasDelPlan = p?.totalEmpresas || 0;
    this.form = p
      ? { idPlan: p.idPlan, nombre: p.nombre, precioMensual: p.precioMensual, maxUsuarios: p.maxUsuarios, maxSucursales: p.maxSucursales, activo: p.estado === 1 }
      : this.formVacio();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  private limiteValido(v: any): boolean {
    return v === null || v === undefined || v === '' || (Number.isInteger(Number(v)) && Number(v) >= 1);
  }

  private validar(): boolean {
    const e: Record<string, string> = {};
    const f = this.form;
    if (!f.nombre.trim()) e['nombre'] = 'El nombre es obligatorio.';
    if (f.precioMensual === null || (f.precioMensual as any) === '' || !(Number(f.precioMensual) >= 0)) {
      e['precioMensual'] = 'El precio debe ser 0 o mayor.';
    }
    if (!this.limiteValido(f.maxUsuarios)) e['maxUsuarios'] = 'Debe ser un entero de 1 o más, o vacío para ilimitado.';
    if (!this.limiteValido(f.maxSucursales)) e['maxSucursales'] = 'Debe ser un entero de 1 o más, o vacío para ilimitado.';
    this.errores = e;
    return Object.keys(e).length === 0;
  }

  private limiteParaEnviar(v: any): number | null {
    return v === null || v === undefined || v === '' ? null : Number(v);
  }

  guardar(): void {
    this.aviso = '';
    if (!this.validar()) return;

    const f = this.form;
    const edita = f.idPlan > 0;
    const cuerpo: PlanPayload = {
      ...(edita ? { idPlan: f.idPlan, estado: f.activo ? 1 : 0 } : {}),
      nombre: f.nombre.trim(),
      precioMensual: Number(f.precioMensual),
      maxUsuarios: this.limiteParaEnviar(f.maxUsuarios),
      maxSucursales: this.limiteParaEnviar(f.maxSucursales)
    };

    this.guardando = true;
    const pet$ = edita ? this.svc.editar(cuerpo) : this.svc.registrar(cuerpo);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        Swal.fire('Éxito', edita ? 'Plan actualizado' : 'Plan creado', 'success');
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        if (err.status === 401 || err.status === 403) return;
        const cuerpoErr = err.error;
        const msg: string = (typeof cuerpoErr === 'string' ? cuerpoErr : cuerpoErr?.message) || 'No se pudo guardar el plan';
        const campos = cuerpoErr?.errors;
        if (err.status === 400 && campos && typeof campos === 'object') {
          this.errores = { ...campos };
        } else if (err.status === 409) {
          this.errores['nombre'] = msg;
        } else if (err.status === 404) {
          this.cerrarModal();
          Swal.fire('No encontrado', msg, 'warning');
          this.cargar();
        } else {
          this.aviso = msg;
        }
      }
    });
  }

  desactivar(p: Plan): void {
    if (!this.puedeDesactivar(p)) return;
    Swal.fire({
      title: `¿Desactivar "${p.nombre}"?`,
      text: 'No se borra: el plan deja de ofrecerse a empresas nuevas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.desactivar(p.idPlan).subscribe({
        next: r => {
          Swal.fire('Desactivado', r?.message || 'Plan desactivado', 'success');
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) return;
          const msg = err.error?.message || 'No se pudo desactivar el plan';
          Swal.fire({ icon: err.status === 409 ? 'info' : 'error', title: err.status === 409 ? 'No se puede desactivar' : 'Error', text: msg });
          if (err.status === 404) this.cargar();
        }
      });
    });
  }
}
