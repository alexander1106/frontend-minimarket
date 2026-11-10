import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { PaginacionComponent } from '../../../../components/paginacion/paginacion.component';
import { LoginService } from '../../../../service/login.service';
import { Proveedor, ProveedorPayload, ProveedoresService } from '../../../../service/proveedores.service';

interface FormProveedor {
  idProveedor: number;
  nombre: string;
  ruc: string;
  regimen: string;
  telefono: string;
  gmail: string;
  direccion: string;
}

interface FichaSunat {
  estado: string;
  condicion: string;
  tipo: string;
  nombreComercial: string;
  fechaInscripcion: string;
  ubicacion: string;
  actividades: string[];
  advertencia: string;
}

const REGIMENES = ['RUS', 'RER', 'Régimen MYPE Tributario', 'Régimen General'];
const RUC_VALIDO = /^(10|15|16|17|20)\d{9}$/;
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-list-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, BarraLateralComponent, HeaderComponent],
  templateUrl: './list-proveedores.component.html',
  styleUrls: ['./list-proveedores.component.css']
})
export class ListProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  filtrados: Proveedor[] = [];
  visibles: Proveedor[] = [];
  filtro = '';
  cargando = true;
  sinPermiso = false;

  paginaActual = 1;
  porPagina = 5;

  puedeEscribir = false;
  private idEmpresa: number | null = null;

  mostrarModal = false;
  guardando = false;
  form: FormProveedor = this.formVacio();
  empresaNombreForm = '';
  regimenes: string[] = [...REGIMENES];
  errores: Record<string, string> = {};
  avisoModal = '';

  consultandoSunat = false;
  sunatNoDisponible = false;
  avisoSunat = '';
  ficha: FichaSunat | null = null;
  private ultimoRucConsultado = '';

  constructor(
    private svc: ProveedoresService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // El SUPERADMIN no pertenece a una empresa y el backend le respondería 403
    if (this.loginService.hasRole('SUPERADMIN')) {
      this.router.navigate(['/admin']);
      return;
    }

    const modulos = this.loginService.getModulosPermitidos();
    this.puedeEscribir = modulos
      ? modulos.includes('Compras')
      : this.loginService.hasAnyRole(['ADMIN', 'ALMACENERO', 'EMPRESA']);

    this.idEmpresa = this.obtenerIdEmpresa();
    this.cargar();
  }

  private obtenerIdEmpresa(): number | null {
    const empresa = this.loginService.getEmpresa();
    const user = this.loginService.getUser();
    const id = empresa?.idempresa ?? empresa?.idEmpresa ?? user?.sucursal?.empresa?.idempresa;
    return id ? Number(id) : null;
  }

  cargar(): void {
    if (!this.idEmpresa) {
      this.cargando = false;
      return;
    }
    this.cargando = true;
    this.svc.listarPorEmpresa(this.idEmpresa).subscribe({
      next: data => {
        // El backend responde [] cuando no hay proveedores
        this.proveedores = Array.isArray(data) ? data : [];
        this.cargando = false;
        this.sinPermiso = false;
        this.aplicarFiltro();
      },
      error: (err: any) => {
        this.cargando = false;
        this.proveedores = [];
        this.aplicarFiltro();
        if (err.status === 403) this.sinPermiso = true;
        else if (err.status !== 401) Swal.fire('Error', this.mensaje(err, 'No se pudieron cargar los proveedores'), 'error');
      }
    });
  }

  aplicarFiltro(resetPagina = true): void {
    const t = this.filtro.trim().toLowerCase();
    this.filtrados = t
      ? this.proveedores.filter(p => (p.nombre || '').toLowerCase().includes(t) || (p.ruc || '').includes(t))
      : [...this.proveedores];
    if (resetPagina) this.paginaActual = 1;
    if (this.paginaActual > this.totalPaginas) this.paginaActual = Math.max(1, this.totalPaginas);
    const inicio = (this.paginaActual - 1) * this.porPagina;
    this.visibles = this.filtrados.slice(inicio, inicio + this.porPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarFilas(n: number): void {
    this.porPagina = n;
    this.aplicarFiltro();
  }

  irAPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.aplicarFiltro(false);
  }

  iniciales(nombre: string): string {
    return (nombre || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  private formVacio(): FormProveedor {
    return { idProveedor: 0, nombre: '', ruc: '', regimen: '', telefono: '', gmail: '', direccion: '' };
  }

  abrirModal(p?: Proveedor): void {
    if (!this.puedeEscribir) return;
    this.errores = {};
    this.avisoModal = '';
    this.avisoSunat = '';
    this.ficha = null;
    this.ultimoRucConsultado = '';
    this.regimenes = [...REGIMENES];
    if (p) {
      this.form = {
        idProveedor: p.idProveedor,
        nombre: p.nombre || '',
        ruc: p.ruc || '',
        regimen: p.regimen || '',
        telefono: p.telefono || '',
        gmail: p.gmail || '',
        direccion: p.direccion || ''
      };
      this.empresaNombreForm = p.empresaNombre || '';
      if (p.regimen && !this.regimenes.includes(p.regimen)) this.regimenes.push(p.regimen);
    } else {
      this.form = this.formVacio();
      this.empresaNombreForm = '';
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  soloNumerosRuc(): void {
    this.form.ruc = this.form.ruc.replace(/\D/g, '').slice(0, 11);
    delete this.errores['ruc'];
    this.avisoSunat = '';
    this.ficha = null;
    if (this.rucValido && !this.form.idProveedor && !this.form.nombre.trim() && this.ultimoRucConsultado !== this.form.ruc) {
      this.consultarSunat();
    }
  }

  get rucValido(): boolean {
    return RUC_VALIDO.test(this.form.ruc);
  }

  private validar(): boolean {
    const e: Record<string, string> = {};
    const f = this.form;
    if (!f.nombre.trim()) e['nombre'] = 'El nombre es obligatorio.';
    else if (f.nombre.trim().length > 150) e['nombre'] = 'Máximo 150 caracteres.';
    if (!f.ruc) e['ruc'] = 'El RUC es obligatorio.';
    else if (!RUC_VALIDO.test(f.ruc)) e['ruc'] = 'El RUC debe tener 11 dígitos y empezar con 10, 15, 16, 17 o 20.';
    if (f.gmail.trim() && !CORREO_VALIDO.test(f.gmail.trim())) e['gmail'] = 'Ingresa un correo válido.';
    if (f.telefono.trim() && f.telefono.replace(/\D/g, '').length < 9) e['telefono'] = 'El teléfono debe tener al menos 9 dígitos.';
    if (!this.idEmpresa) e['idEmpresa'] = 'No se pudo determinar tu empresa.';
    this.errores = e;
    return Object.keys(e).length === 0;
  }

  guardar(): void {
    this.avisoModal = '';
    if (!this.validar()) return;

    const f = this.form;
    const opcional = (v: string) => (v.trim() ? v.trim() : null);
    const edita = f.idProveedor > 0;
    const payload: ProveedorPayload = {
      ...(edita ? { idProveedor: f.idProveedor } : {}),
      nombre: f.nombre.trim(),
      ruc: f.ruc,
      regimen: opcional(f.regimen),
      telefono: opcional(f.telefono),
      gmail: opcional(f.gmail),
      direccion: opcional(f.direccion),
      idEmpresa: this.idEmpresa as number
    };

    this.guardando = true;
    const pet$ = edita ? this.svc.editar(payload) : this.svc.registrar(payload);
    pet$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        Swal.fire('Éxito', edita ? 'Proveedor actualizado' : 'Proveedor registrado', 'success');
        this.cargar();
      },
      error: (err: any) => {
        this.guardando = false;
        this.manejarErrorGuardado(err);
      }
    });
  }

  private manejarErrorGuardado(err: any): void {
    const msg = this.mensaje(err, 'No se pudo guardar el proveedor');
    if (err.status === 400 && err.error?.errors && typeof err.error.errors === 'object') {
      this.errores = { ...err.error.errors };
      this.avisoModal = err.error.message || '';
    } else if (err.status === 404) {
      this.cerrarModal();
      Swal.fire('No encontrado', msg, 'warning');
      this.cargar();
    } else if (err.status === 409) {
      if (/ruc/i.test(msg)) this.errores['ruc'] = msg;
      else this.avisoModal = msg;
    } else if (err.status === 403) {
      // El interceptor ya avisó "No tienes permisos para esta operación"
      this.cerrarModal();
    } else if (err.status !== 401) {
      this.avisoModal = msg;
    }
  }

  eliminar(p: Proveedor): void {
    if (!this.puedeEscribir) return;
    Swal.fire({
      title: `¿Eliminar a ${p.nombre}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.eliminar(p.idProveedor).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Proveedor eliminado', 'success');
          this.cargar();
        },
        error: (err: any) => {
          if (err.status === 403 || err.status === 401) return;
          const msg = this.mensaje(err, 'No se pudo eliminar el proveedor');
          if (err.status === 404) {
            Swal.fire('No encontrado', msg, 'warning');
            this.cargar();
          } else {
            // 409 (tiene compras) y otros: se muestra el mensaje tal cual
            const conflicto = err.status === 409;
            Swal.fire({ icon: conflicto ? 'info' : 'error', title: conflicto ? 'No se puede eliminar' : 'Error', text: msg });
          }
        }
      });
    });
  }

  consultarSunat(): void {
    if (!this.rucValido || this.consultandoSunat || this.sunatNoDisponible) return;
    if (!this.svc.sunatConfigurado) {
      this.sunatNoDisponible = true;
      this.avisoSunat = 'Consulta SUNAT no disponible: falta el token gratuito (apisPeruToken en components/link.ts).';
      return;
    }
    this.consultandoSunat = true;
    this.avisoSunat = '';
    this.ficha = null;
    const ruc = this.form.ruc;
    this.ultimoRucConsultado = ruc;
    this.svc.consultarSunat(ruc).subscribe({
      next: (resp: any) => {
        this.consultandoSunat = false;
        if (this.form.ruc !== ruc) return;
        const d = resp?.data ?? resp ?? {};
        const razon = d.razonSocial || d.razon_social || d.nombreRazonSocial || d.nombre || '';
        const ubicacion = [d.distrito, d.provincia, d.departamento].map(x => this.textoUtil(x)).filter(Boolean).join(', ');
        const calle = this.textoUtil(d.direccion) || this.textoUtil(d.domicilioFiscal);
        const direccion = [calle, calle ? ubicacion : ''].filter(Boolean).join(' - ') || ubicacion;
        const telefono = (Array.isArray(d.telefonos) ? d.telefonos : []).map((t: any) => this.textoUtil(t)).find(Boolean) || '';
        if (razon) {
          this.form.nombre = String(razon).slice(0, 150);
          delete this.errores['nombre'];
        }
        // Solo se completan campos vacíos: nunca se pisa lo que escribió el usuario
        if (direccion && !this.form.direccion.trim()) this.form.direccion = direccion;
        if (telefono && !this.form.telefono.trim()) this.form.telefono = telefono;

        const estado = this.textoUtil(d.estado);
        const condicion = this.textoUtil(d.condicion);
        const advertencias: string[] = [];
        if (estado && estado.toUpperCase() !== 'ACTIVO') advertencias.push(`El contribuyente figura como ${estado}.`);
        if (condicion && condicion.toUpperCase() !== 'HABIDO') advertencias.push(`Su condición en SUNAT es ${condicion}.`);
        const actividades = (Array.isArray(d.actEconomicas) ? d.actEconomicas : [])
          .map((a: any) => this.textoUtil(a)).filter(Boolean).slice(0, 2);
        this.ficha = {
          estado, condicion,
          tipo: this.textoUtil(d.tipo),
          nombreComercial: this.textoUtil(d.nombreComercial),
          fechaInscripcion: this.textoUtil(d.fechaInscripcion),
          ubicacion,
          actividades,
          advertencia: advertencias.join(' ')
        };
        this.avisoSunat = razon || direccion
          ? 'Datos cargados desde SUNAT'
          : 'SUNAT no devolvió la razón social de este RUC. Escríbela manualmente.';
      },
      error: (err: any) => {
        this.consultandoSunat = false;
        if (err.status === 401 || err.status === 403) {
          this.sunatNoDisponible = true;
          this.avisoSunat = 'El token de la consulta SUNAT no es válido. Revisa apisPeruToken en components/link.ts.';
        } else if (err.status === 404) {
          this.avisoSunat = 'SUNAT no encontró ese RUC. Verifícalo o escribe los datos manualmente.';
        } else if (err.status === 429) {
          this.avisoSunat = 'Demasiadas consultas seguidas, espera un momento e inténtalo de nuevo.';
        } else {
          this.avisoSunat = 'No se pudo consultar a SUNAT, inténtalo de nuevo';
        }
      }
    });
  }

  private textoUtil(v: any): string {
    const t = v == null ? '' : String(v).trim();
    return t === '-' ? '' : t;
  }

  private mensaje(err: any, porDefecto: string): string {
    let e = err?.error;
    if (typeof e === 'string') {
      try { e = JSON.parse(e); } catch { return e.trim() || porDefecto; }
    }
    return e?.message || e?.Detalle || e?.error || porDefecto;
  }
}
