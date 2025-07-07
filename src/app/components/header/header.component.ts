import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  empresaNombre: string = '';
  username: string = '';
  userRole: string = '';

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    // Recuperar empresa
    const empresa = this.loginService.getEmpresa();
    if (empresa) {
      console.log('Empresa recuperada:', empresa);

      if (typeof empresa === 'object' && empresa.razonsocial) {
        this.empresaNombre = empresa.razonsocial;
      } else if (typeof empresa === 'string') {
        this.empresaNombre = empresa;
      } else {
        this.empresaNombre = '';
      }
    }

    // Recuperar nombre de usuario
    const username = this.loginService.getUsername();
    if (username) {
      this.username = username;
    } else {
      // Si no usas setUsername, puedes obtenerlo del objeto user
      const user = this.loginService.getUser();
      if (user && user.nombre) {
        this.username = user.nombre;
      }
    }

    // Recuperar rol
    const rol = this.loginService.getUserRole();
    if (rol) {
      this.userRole = rol;
    }
  }
}
