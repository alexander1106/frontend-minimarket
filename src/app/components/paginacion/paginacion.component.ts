import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pag">
      <div class="pag-info" *ngIf="total > 0; else sinRegistros">
        Mostrando <strong>{{ desde }}–{{ hasta }}</strong> de <strong>{{ total }}</strong>
      </div>
      <ng-template #sinRegistros><div class="pag-info">Sin registros</div></ng-template>

      <label class="pag-filas">
        Filas
        <select [ngModel]="porPagina" (ngModelChange)="cambiarFilas($event)" [attr.aria-label]="'Filas por página'">
          <option *ngFor="let o of opciones" [ngValue]="o">{{ o }}</option>
        </select>
      </label>

      <nav class="pag-nav" *ngIf="totalPaginas > 1" aria-label="Paginación">
        <button type="button" (click)="ir(pagina - 1)" [disabled]="pagina <= 1" aria-label="Anterior">
          <i class="fas fa-chevron-left"></i>
        </button>
        <ng-container *ngFor="let p of paginas">
          <span class="pag-gap" *ngIf="p === 0">…</span>
          <button type="button" *ngIf="p !== 0" [class.on]="p === pagina" (click)="ir(p)"
                  [attr.aria-current]="p === pagina ? 'page' : null">{{ p }}</button>
        </ng-container>
        <button type="button" (click)="ir(pagina + 1)" [disabled]="pagina >= totalPaginas" aria-label="Siguiente">
          <i class="fas fa-chevron-right"></i>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; position: fixed; left: var(--sidebar-w, 292px); right: 0; bottom: 0; z-index: 20; }
    .pag { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; flex-wrap: wrap;
           padding: 12px 20px; border-top: 1px solid var(--line, #e5e7eb); background: var(--surface-alt, #f9fafb);
           color: var(--ink-500, #6b7280); font-size: 13px;
           box-shadow: 0 -6px 16px rgba(16, 24, 40, .06); }
    .pag-info strong { color: var(--ink-900, #111827); }
    .pag-filas { display: flex; align-items: center; gap: 8px; margin: 0 0 0 auto; font-weight: 500; }
    .pag-filas select { height: 34px; padding: 0 8px; border: 1px solid var(--line, #e5e7eb); border-radius: 8px;
                        background: #fff; color: var(--ink-900, #111827); font-weight: 600; }
    .pag-nav { display: flex; align-items: center; gap: 4px; }
    .pag-nav button { min-width: 34px; height: 34px; padding: 0 8px; border: 1px solid var(--line, #e5e7eb);
                      border-radius: 8px; background: #fff; color: var(--ink-700, #374151); font-weight: 600; cursor: pointer; }
    .pag-nav button:hover:not(:disabled):not(.on) { background: var(--brand-50, #ecfdf5); }
    .pag-nav button.on { background: var(--brand-500, #10b981); border-color: var(--brand-500, #10b981); color: #fff; }
    .pag-nav button:disabled { opacity: .4; cursor: not-allowed; }
    .pag-gap { padding: 0 4px; color: var(--ink-400, #9ca3af); }
    @media (max-width: 768px) { :host { left: 0; } }
    @media (max-width: 640px) { .pag-filas { margin-left: 0; } }
  `]
})
export class PaginacionComponent implements OnChanges {
  @Input() total = 0;
  @Input() pagina = 1;
  @Input() porPagina = 5;
  @Input() opciones: number[] = [5, 10, 20, 50];

  @Output() paginaChange = new EventEmitter<number>();
  @Output() porPaginaChange = new EventEmitter<number>();

  ngOnChanges(): void {
    if (this.pagina > this.totalPaginas) {
      const destino = this.totalPaginas;
      Promise.resolve().then(() => this.paginaChange.emit(destino));
    }
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.porPagina));
  }

  get desde(): number {
    return this.total ? (this.pagina - 1) * this.porPagina + 1 : 0;
  }

  get hasta(): number {
    return Math.min(this.total, this.pagina * this.porPagina);
  }

  get paginas(): number[] {
    const n = this.totalPaginas;
    if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
    const set = new Set([1, n, this.pagina - 1, this.pagina, this.pagina + 1]);
    const lista = [...set].filter(p => p >= 1 && p <= n).sort((a, b) => a - b);
    const salida: number[] = [];
    lista.forEach((p, i) => {
      if (i > 0 && p - lista[i - 1] > 1) salida.push(0);
      salida.push(p);
    });
    return salida;
  }

  ir(p: number): void {
    if (p < 1 || p > this.totalPaginas || p === this.pagina) return;
    this.paginaChange.emit(p);
  }

  cambiarFilas(n: number): void {
    this.porPaginaChange.emit(Number(n));
  }
}
