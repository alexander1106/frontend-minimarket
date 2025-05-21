import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Importar esto
import { RouterModule } from '@angular/router'; // <-- IMPORTANTE

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule,RouterModule], // ✅ Agregar aquí
  templateUrl: './barra-lateral.component.html',
  styleUrl: './barra-lateral.component.css'
})
export class BarraLateralComponent {
  activeMenu: string | null = null;

  toggleSubmenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }
}
