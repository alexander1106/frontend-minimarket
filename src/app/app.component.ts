import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginService } from './service/login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'sistema-clinico-reservas';

  constructor(loginService: LoginService) {
    loginService.cerrarSesionTemporalSiCorresponde();
  }
}
