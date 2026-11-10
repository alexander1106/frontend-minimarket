import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MenuLateralService {
  private readonly clase = 'menu-abierto';

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.cerrar());
    document.addEventListener('click', e => {
      if (!this.abierto) return;
      const destino = e.target as HTMLElement | null;
      if (destino?.closest('.barra') || destino?.closest('.btn-menu')) return;
      this.cerrar();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.cerrar(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 992) this.cerrar(); });
  }

  get abierto(): boolean {
    return document.body.classList.contains(this.clase);
  }

  alternar(): void {
    document.body.classList.toggle(this.clase);
  }

  cerrar(): void {
    document.body.classList.remove(this.clase);
  }
}
