import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ICONOS_NOTIFICACION, Notificacion, NotificacionesService, tiempoRelativo } from '../../service/notificaciones.service';

@Component({
  selector: 'app-campana',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campana.component.html',
  styleUrl: './campana.component.css'
})
export class CampanaComponent implements OnInit, OnDestroy {
  noLeidas = 0;
  abierto = false;
  cargando = false;
  items: Notificacion[] = [];
  readonly iconos = ICONOS_NOTIFICACION;
  readonly tiempo = tiempoRelativo;

  private sub?: Subscription;
  private timer?: any;
  private alVolver = () => { if (!document.hidden) this.service.refrescarContador(); };

  constructor(private service: NotificacionesService, private router: Router, private el: ElementRef) {}

  ngOnInit(): void {
    this.sub = this.service.noLeidas$.subscribe(n => (this.noLeidas = n));
    this.service.refrescarContador();
    this.timer = setInterval(() => {
      if (document.hidden) return;
      this.service.refrescarContador();
      if (this.abierto) this.cargar();
    }, 45000);
    document.addEventListener('visibilitychange', this.alVolver);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearInterval(this.timer);
    document.removeEventListener('visibilitychange', this.alVolver);
  }

  get contador(): string {
    return this.noLeidas > 99 ? '99+' : String(this.noLeidas);
  }

  alternar(): void {
    this.abierto = !this.abierto;
    if (this.abierto) this.cargar();
  }

  cargar(): void {
    this.cargando = !this.items.length;
    this.service.listar({ tamano: 10 }).subscribe({
      next: r => { this.items = r?.items || []; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  abrir(n: Notificacion): void {
    const ir = () => {
      const ruta = this.service.rutaDestino(n.ruta);
      this.abierto = false;
      if (ruta) this.router.navigateByUrl(ruta);
    };
    if (n.leida) { ir(); return; }
    n.leida = true;
    this.service.marcarLeida(n.idNotificacion).subscribe({ next: ir, error: () => { this.cargar(); ir(); } });
  }

  marcarTodas(): void {
    this.service.marcarTodas().subscribe(() => this.items.forEach(i => (i.leida = true)));
  }

  @HostListener('document:click', ['$event'])
  fuera(e: Event): void {
    if (this.abierto && !this.el.nativeElement.contains(e.target)) this.abierto = false;
  }

  @HostListener('document:keydown.escape')
  esc(): void {
    this.abierto = false;
  }
}
