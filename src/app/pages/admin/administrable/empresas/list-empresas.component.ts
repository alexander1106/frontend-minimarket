import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { EmpresasService } from '../../../../service/empresas.service';
import { SucursalesService } from '../../../../service/sucursales.service';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { PaginarPipe } from '../../../../components/paginacion/paginar.pipe';

interface Empresa {
  idempresa: number;
  nombreComercial?: string;
  razonsocial: string;
  ciudad: string;
  direccion: string;
  ruc: string;
  correo: string;
  fechaRegistro?: string;
  estado: number;
  logoBase64?: string;
  cantidadSucursales?: number;
  sunatVerificado?: boolean;
  propietario?: { nombre?: string; telefono?: string } | null;
  ubicacion?: { ciudad?: string; distrito?: string } | null;
  plan?: { idPlan?: number; nombre?: string; ciclo?: string; precioMensual?: number } | null;
  ingresoMensual?: number;
  moneda?: string;
  vencimiento?: string | null;
  fechaAlta?: string | null;
  usuarios?: { usados: number; limite: number | null } | null;
  estadoSuscripcion?: { codigo: string; etiqueta: string; diasRestantes?: number | null } | null;
}

interface EmpresaForm {
  nombreComercial: string;
  ruc: string;
  razonsocial: string;
  propietario: string;
  correo: string;
  telefono: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  departamento: string;
  sucursales: number;
  idPlan: number | null;
  ciclo: string;
  estadoInicial: string;
  facturacionElectronica: boolean;
  notas: string;
  fechaVencimiento: string;
}

const FORM_VACIO = (): EmpresaForm => ({
  nombreComercial: '', ruc: '', razonsocial: '', propietario: '', correo: '', telefono: '',
  direccion: '', distrito: '', ciudad: '', departamento: '', sucursales: 1, idPlan: null,
  ciclo: 'MENSUAL', estadoInicial: 'ACTIVO', facturacionElectronica: false, notas: '', fechaVencimiento: ''
});

@Component({
  selector: 'app-list-empresas',
  standalone: true,
  imports: [PaginacionComponent, PaginarPipe, 
    CommonModule,
    FormsModule,
    HttpClientModule,
    BarraLateralComponent,
    HeaderComponent,
  ],
  templateUrl: './list-empresas.component.html',
  styleUrls: ['./list-empresas.component.css']
})
export class ListEmpresasComponent implements OnInit {
  pagina = 1;
  porPagina = 5;
  empresas: Empresa[] = [];
  filtrados: Empresa[] = [];
  filtro = '';
  tab: 'todas' | 'activas' | 'prueba' | 'vencidas' | 'suspendidas' = 'todas';
  planes: any[] = [];
  form: EmpresaForm = FORM_VACIO();
  errores: Record<string, string> = {};
  guardando = false;
  filtroCiudad = '';
  orden: 'razonsocial' | 'fechaRegistro' | 'ciudad' = 'razonsocial';
  asc = true;
  sucursales: any[] = [];
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

  selectedFile: File | null = null;
  logoPreview: string | null = null;

  paginaActual = 1;
  elementosPorPagina = 5;

  constructor(private svc: EmpresasService, private sucSvc: SucursalesService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(p => {
      this.filtro = p.get('q') || '';
      this.aplicarFiltro();
      if (p.has('nuevo')) { this.abrirModal(); }
    });
    this.cargarEmpresas();
    this.svc.listarPlanes().subscribe({ next: (d: any) => (this.planes = Array.isArray(d) ? d : []), error: () => (this.planes = []) });
    this.sucSvc.listarSucursales().subscribe({
      next: (d: any) => { this.sucursales = Array.isArray(d) ? d : []; this.aplicarFiltro(); },
      error: () => (this.sucursales = [])
    });
  }

  private cargarEmpresas(): void {
    this.svc.listarEmpresas().subscribe({
      next: data => {
        this.empresas = data.map((e: any) => ({
          ...e,
          logoBase64: e.logo ? `data:image/png;base64,${e.logo}` : null
        }));
        this.aplicarFiltro();
      },
      error: () =>
        Swal.fire('Error', 'No se pudieron cargar las empresas', 'error')
    });
  }

  aplicarFiltro(): void {
    const q = this.filtro.trim().toLowerCase();
    const lista = this.empresas.filter(e => {
      const coincide = !q ||
        (e.razonsocial || '').toLowerCase().includes(q) ||
        (e.nombreComercial || '').toLowerCase().includes(q) ||
        (e.ruc || '').toLowerCase().includes(q) ||
        (e.correo || '').toLowerCase().includes(q);
      const ciudadOk = !this.filtroCiudad || e.ciudad === this.filtroCiudad;
      const tabOk = this.tab === 'todas' || this.codigoEstado(e) === this.tab;
      return coincide && ciudadOk && tabOk;
    });
    const dir = this.asc ? 1 : -1;
    lista.sort((x, y) => dir * String((x as any)[this.orden] ?? '').localeCompare(String((y as any)[this.orden] ?? ''), 'es', { sensitivity: 'base' }));
    this.filtrados = lista;
  }

  cambiarTab(t: 'todas' | 'activas' | 'prueba' | 'vencidas' | 'suspendidas'): void {
    this.tab = t;
    this.aplicarFiltro();
  }

  alternarOrden(): void {
    this.asc = !this.asc;
    this.aplicarFiltro();
  }

  get ciudades(): string[] {
    return [...new Set(this.empresas.map(e => e.ciudad).filter(c => !!c))].sort((a, b) => a.localeCompare(b, 'es'));
  }

  codigoEstado(e: Empresa): string {
    switch (e.estadoSuscripcion?.codigo) {
      case 'PRUEBA': return 'prueba';
      case 'VENCIDO': return 'vencidas';
      case 'SUSPENDIDO': return 'suspendidas';
      default: return 'activas';
    }
  }

  contar(tab: string): number {
    return tab === 'todas' ? this.empresas.length : this.empresas.filter(e => this.codigoEstado(e) === tab).length;
  }

  totalSucursales(e: Empresa): number {
    return e.cantidadSucursales ?? this.sucursalesDe(e).length;
  }

  claseEstado(e: Empresa): string {
    return (e.estadoSuscripcion?.codigo || 'ACTIVO').toLowerCase();
  }

  get ingresoTotal(): number {
    return this.empresas.reduce((a, e) => a + Number(e.ingresoMensual || 0), 0);
  }

  nombresSucursales(e: Empresa): string {
    return this.sucursalesDe(e).map(s => s.nombreSucursal).join(', ');
  }

  colorDe(nombre: string): string {
    const paleta = ['#047857', '#059669', '#0f766e', '#0e7490', '#115e59', '#1e3a5f', '#334155'];
    let h = 0;
    for (const ch of nombre || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return paleta[h % paleta.length];
  }

  exportarCsv(): void {
    const filas = [['Razon social', 'RUC', 'Propietario', 'Telefono', 'Correo', 'Ciudad', 'Distrito', 'Sucursales', 'Plan', 'Ciclo', 'Ingreso mensual', 'Vencimiento', 'Usuarios', 'Estado']];
    this.filtrados.forEach(e => filas.push([
      e.nombreComercial || e.razonsocial, e.ruc, e.propietario?.nombre || '', e.propietario?.telefono || '', e.correo,
      e.ubicacion?.ciudad || e.ciudad, e.ubicacion?.distrito || '',
      String(this.totalSucursales(e)), e.plan?.nombre || '', e.plan?.ciclo || '',
      String(e.ingresoMensual ?? 0), e.vencimiento || '',
      e.usuarios ? `${e.usuarios.usados}/${e.usuarios.limite ?? ''}` : '',
      e.estadoSuscripcion?.etiqueta || 'Activo'
    ]));
    const csv = filas.map(f => f.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'empresas.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  sucursalesDe(e: Empresa): any[] {
    return this.sucursales.filter(s =>
      (s.id_empresa ?? s.idEmpresa) === e.idempresa || (s.empresaNombre && s.empresaNombre === e.razonsocial));
  }

  iniciales(nombre: string): string {
    const p = (nombre || '?').trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || p[0]?.[1] || '')).toUpperCase();
  }

  get empresasActivas(): number { return this.empresas.filter(e => e.estado === 1).length; }
  get sucursalesActivas(): number { return this.sucursales.filter(s => s.estado === 1).length; }
  get promedioSucursales(): number { return this.empresas.length ? this.sucursales.length / this.empresas.length : 0; }

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
    this.errores = {};
    if (e) {
      this.form = {
        ...FORM_VACIO(),
        nombreComercial: e.nombreComercial || e.razonsocial || '',
        ruc: e.ruc || '',
        razonsocial: e.razonsocial || '',
        propietario: e.propietario?.nombre || '',
        correo: e.correo || '',
        telefono: e.propietario?.telefono || '',
        direccion: e.direccion || '',
        distrito: e.ubicacion?.distrito || '',
        ciudad: e.ubicacion?.ciudad || e.ciudad || '',
        idPlan: e.plan?.idPlan ?? null,
        ciclo: e.plan?.ciclo || 'MENSUAL',
        fechaVencimiento: e.vencimiento || ''
      };
      this.empresa = { ...e };
      this.logoPreview = e.logoBase64 ?? null;
    } else {
      this.form = FORM_VACIO();
      this.empresa = { idempresa: 0, razonsocial: '', ciudad: '', direccion: '', ruc: '', correo: '', estado: 1 };
      this.logoPreview = null;
    }
    this.selectedFile = null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.selectedFile = null;
    this.logoPreview = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.logoPreview = null;
    }
  }

  private validar(): Record<string, string> {
    const f = this.form;
    const err: Record<string, string> = {};
    if (!f.nombreComercial.trim()) err['nombreComercial'] = 'El nombre comercial es obligatorio.';
    if (!/^\d{11}$/.test(f.ruc.trim())) err['ruc'] = 'El RUC debe tener 11 dígitos.';
    if (!f.propietario.trim()) err['propietario'] = 'El propietario es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.trim())) err['correo'] = 'Ingresa un correo válido.';
    if (f.telefono.replace(/\D/g, '').length < 9) err['telefono'] = 'El teléfono debe tener al menos 9 dígitos.';
    if (!f.direccion.trim()) err['direccion'] = 'La dirección es obligatoria.';
    if (!this.empresa.idempresa && (!f.sucursales || f.sucursales < 1)) err['sucursales'] = 'Debe ser 1 o más.';
    return err;
  }

  formSubmit(): void {
    this.errores = this.validar();
    if (Object.keys(this.errores).length) return;

    const f = this.form;
    const cuerpo: any = {
      nombreComercial: f.nombreComercial.trim(),
      ruc: f.ruc.trim(),
      razonsocial: f.razonsocial.trim(),
      propietario: f.propietario.trim(),
      correo: f.correo.trim(),
      telefono: f.telefono.trim(),
      direccion: f.direccion.trim(),
      distrito: f.distrito.trim(),
      ciudad: f.ciudad.trim(),
      departamento: f.departamento.trim(),
      ciclo: f.ciclo,
      facturacionElectronica: f.facturacionElectronica,
      notas: f.notas.trim()
    };
    if (f.idPlan) cuerpo.idPlan = f.idPlan;
    if (f.fechaVencimiento) cuerpo.fechaVencimiento = f.fechaVencimiento;

    const editando = this.empresa.idempresa > 0;
    if (!editando) {
      cuerpo.sucursales = f.sucursales;
      cuerpo.estadoInicial = f.estadoInicial;
    }

    this.guardando = true;
    const peticion = editando
      ? this.svc.actualizar(this.empresa.idempresa, cuerpo)
      : this.svc.registrar(cuerpo);

    peticion.subscribe({
      next: (resp: any) => {
        this.subirLogo(resp, cuerpo).finally(() => {
          this.guardando = false;
          Swal.fire('Éxito', editando ? 'Empresa actualizada' : 'Empresa registrada correctamente', 'success');
          this.cerrarModal();
          this.cargarEmpresas();
          this.sucSvc.listarSucursales().subscribe({ next: (d: any) => { this.sucursales = Array.isArray(d) ? d : []; this.aplicarFiltro(); } });
        });
      },
      error: err => {
        this.guardando = false;
        // 400: errores por campo -> junto a cada input
        if (err.status === 400 && err.error?.errors) {
          this.errores = err.error.errors;
          return;
        }
        // 409 (RUC repetido o límite del plan) y otros
        Swal.fire('Atención', err.error?.message || 'Ha ocurrido un error', err.status === 409 ? 'warning' : 'error');
      }
    });
  }

  /** El JSON no lleva archivo: si se eligió un logo se sube con el PUT multipart de siempre. */
  private subirLogo(resp: any, cuerpo: any): Promise<void> {
    const id = resp?.idempresa || this.empresa.idempresa;
    if (!this.selectedFile || !id) return Promise.resolve();
    const fd = new FormData();
    fd.append('idempresa', String(id));
    fd.append('razonsocial', resp?.razonsocial || cuerpo.razonsocial || cuerpo.nombreComercial);
    fd.append('ciudad', resp?.ciudad || cuerpo.ciudad || '');
    fd.append('direccion', resp?.direccion || cuerpo.direccion);
    fd.append('ruc', resp?.ruc || cuerpo.ruc);
    fd.append('correo', resp?.correo || cuerpo.correo);
    fd.append('fechaRegistro', resp?.fechaRegistro || new Date().toISOString().substring(0, 10));
    fd.append('estado', String(resp?.estado ?? 1));
    fd.append('logo', this.selectedFile, this.selectedFile.name);
    return new Promise(resolve => this.svc.editar(fd).subscribe({ next: () => resolve(), error: () => resolve() }));
  }

  detalle: Empresa | null = null;

  ver(e: Empresa): void {
    this.detalle = e;
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }

  editarDesdeDetalle(): void {
    const e = this.detalle;
    this.detalle = null;
    if (e) this.abrirModal(e);
  }

  usoUsuarios(e: Empresa): number {
    if (!e.usuarios || !e.usuarios.limite) return 0;
    return Math.min(100, Math.round((e.usuarios.usados / e.usuarios.limite) * 100));
  }

  alternarSuspension(e: Empresa): void {
    const suspendida = e.estadoSuscripcion?.codigo === 'SUSPENDIDO';
    Swal.fire({
      title: suspendida ? '¿Reactivar empresa?' : '¿Suspender empresa?',
      text: suspendida ? 'Volverá a contar su plan en los ingresos.' : 'Quedará suspendida y sin ingreso mensual.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: suspendida ? 'Sí, reactivar' : 'Sí, suspender'
    }).then(res => {
      if (!res.isConfirmed) return;
      const peticion = suspendida ? this.svc.reactivar(e.idempresa) : this.svc.suspender(e.idempresa);
      peticion.subscribe({
        next: () => this.cargarEmpresas(),
        error: err => Swal.fire('Error', err.error?.message || 'No se pudo cambiar el estado', 'error')
      });
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
