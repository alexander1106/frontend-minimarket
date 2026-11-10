import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { PaginacionComponent } from '../../../components/paginacion/paginacion.component';
import {
  AuditoriaService, DetalleAuditoria, ETIQUETAS_ACCION, FiltrosAuditoria, RegistroAuditoria, ResumenAuditoria
} from '../../../service/auditoria.service';
import { EmpresasService } from '../../../service/empresas.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, BarraLateralComponent, HeaderComponent, PaginacionComponent],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css'
})
export class AuditoriaComponent implements OnInit {
  items: RegistroAuditoria[] = [];
  total = 0;
  pagina = 1;
  porPagina = 25;
  cargando = true;

  resumen: ResumenAuditoria | null = null;
  filtrosDisponibles: FiltrosAuditoria = { acciones: [], modulos: [], usuarios: [] };
  empresas: any[] = [];

  desde = this.fechaHace(7);
  hasta = this.fechaHace(0);
  accion = '';
  modulo = '';
  username = '';
  idEmpresa: number | null = null;
  q = '';
  soloFallidas = false;

  detalle: DetalleAuditoria | null = null;
  cargandoDetalle = false;

  readonly etiquetas = ETIQUETAS_ACCION;

  constructor(private service: AuditoriaService, private empresasService: EmpresasService) {}

  ngOnInit(): void {
    this.service.filtros().subscribe({
      next: f => (this.filtrosDisponibles = { acciones: f?.acciones || [], modulos: f?.modulos || [], usuarios: f?.usuarios || [] }),
      error: () => {}
    });
    this.empresasService.listarEmpresas().subscribe({
      next: (d: any) => (this.empresas = Array.isArray(d) ? d : []),
      error: () => {}
    });
    this.actualizar();
  }

  private fechaHace(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  actualizar(): void {
    this.cargarResumen();
    this.cargar();
  }

  filtrar(): void {
    this.pagina = 1;
    this.actualizar();
  }

  limpiar(): void {
    this.desde = this.fechaHace(7);
    this.hasta = this.fechaHace(0);
    this.accion = '';
    this.modulo = '';
    this.username = '';
    this.idEmpresa = null;
    this.q = '';
    this.soloFallidas = false;
    this.filtrar();
  }

  private cargarResumen(): void {
    this.service.resumen(this.desde, this.hasta).subscribe({
      next: r => (this.resumen = r),
      error: () => (this.resumen = null)
    });
  }

  cargar(): void {
    this.cargando = true;
    this.service.listar({
      desde: this.desde,
      hasta: this.hasta,
      username: this.username.trim(),
      idEmpresa: this.idEmpresa,
      accion: this.accion,
      modulo: this.modulo,
      exito: this.soloFallidas ? false : null,
      q: this.q.trim(),
      pagina: this.pagina - 1,
      tamano: this.porPagina
    }).subscribe({
      next: r => {
        this.items = r?.items || [];
        this.total = r?.total || 0;
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        if (err.status !== 401 && err.status !== 403) Swal.fire('Error', 'No se pudo cargar la auditoría', 'error');
      }
    });
  }

  cambiarPagina(p: number): void {
    this.pagina = p;
    this.cargar();
  }

  cambiarFilas(n: number): void {
    this.porPagina = n;
    this.pagina = 1;
    this.cargar();
  }

  contar(clave: string): number {
    return this.resumen?.porAccion?.[clave] || 0;
  }

  get usuariosTop(): { nombre: string; total: number }[] {
    return Object.entries(this.resumen?.topUsuarios || {}).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total).slice(0, 5);
  }

  get modulosTop(): { nombre: string; total: number; ancho: number }[] {
    const lista = Object.entries(this.resumen?.porModulo || {}).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total).slice(0, 6);
    const max = Math.max(1, ...lista.map(l => l.total));
    return lista.map(l => ({ ...l, ancho: Math.round((l.total / max) * 100) }));
  }

  claseAccion(a: string): string {
    return (a || 'OTRO').toLowerCase().replace(/_/g, '-');
  }

  ver(r: RegistroAuditoria): void {
    this.cargandoDetalle = true;
    this.detalle = { ...(r as DetalleAuditoria), idUsuario: null, metodo: '', ruta: '', ip: '', userAgent: '', duracionMs: null, detalle: null };
    this.service.detalle(r.id).subscribe({
      next: d => { this.detalle = d; this.cargandoDetalle = false; },
      error: err => {
        this.cargandoDetalle = false;
        this.detalle = null;
        if (err.status === 404) {
          Swal.fire('Registro no disponible', 'Este registro ya no existe.', 'info');
          this.cargar();
        } else if (err.status !== 401 && err.status !== 403) {
          Swal.fire('Error', 'No se pudo cargar el detalle', 'error');
        }
      }
    });
  }

  cerrarDetalle(): void {
    this.detalle = null;
  }

  get datosEnviados(): { campo: string; valor: string }[] | null {
    const t = this.partesDetalle.cuerpo;
    if (!t) return null;
    try {
      const j = JSON.parse(t);
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        return Object.entries(j).map(([campo, valor]) => ({
          campo,
          valor: valor !== null && typeof valor === 'object' ? JSON.stringify(valor, null, 2) : String(valor)
        }));
      }
    } catch {}
    return null;
  }

  get partesDetalle(): { cuerpo: string; respuesta: string } {
    const t = (this.detalle?.detalle || '').trim();
    if (!t) return { cuerpo: '', respuesta: '' };
    const i = t.indexOf('Respuesta:');
    if (i === -1) return { cuerpo: t, respuesta: '' };
    return { cuerpo: t.slice(0, i).trim(), respuesta: t.slice(i + 'Respuesta:'.length).trim() };
  }

  get cuerpoComoTexto(): string {
    const t = this.partesDetalle.cuerpo;
    try { return JSON.stringify(JSON.parse(t), null, 2); } catch { return t; }
  }

  navegador(ua: string): string {
    if (!ua) return '—';
    const sistema = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iOS/i.test(ua) ? 'iOS' : /Mac OS/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : '';
    const nav = /Edg\//i.test(ua) ? 'Edge' : /OPR\//i.test(ua) ? 'Opera' : /Chrome\//i.test(ua) ? 'Chrome' : /Firefox\//i.test(ua) ? 'Firefox' : /Safari\//i.test(ua) ? 'Safari' : '';
    return [nav, sistema].filter(Boolean).join(' en ') || ua.slice(0, 40);
  }

  exportarCsv(): void {
    if (!this.items.length) return;
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cab = ['Fecha', 'Usuario', 'Rol', 'Empresa', 'Acción', 'Módulo', 'Descripción', 'Resultado'];
    const filas = this.items.map(r => [
      r.fecha, r.username, r.rol, r.empresa, this.etiquetas[r.accion] || r.accion, r.modulo, r.descripcion,
      r.exito ? 'OK' : `Falló${r.estadoHttp ? ' ' + r.estadoHttp : ''}`
    ].map(esc).join(','));
    const csv = '﻿' + [cab.map(esc).join(','), ...filas].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${this.desde}_${this.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
