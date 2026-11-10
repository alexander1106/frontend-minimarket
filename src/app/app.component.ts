import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './service/login.service';
import { MenuLateralService } from './service/menu-lateral.service';
import baseUrl from './components/link';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'sistema-clinico-reservas';

  constructor(loginService: LoginService, _menu: MenuLateralService) {
    loginService.cerrarSesionTemporalSiCorresponde();
    this.mantenerServidorDespierto();
  }

  private mantenerServidorDespierto(): void {
    if (/localhost|127\.0\.0\.1/.test(baseUrl)) return;
    const despertar = () => {
      if (document.hidden) return;
      fetch(baseUrl, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
    };
    despertar();
    setInterval(despertar, 9 * 60 * 1000);
  }
}
