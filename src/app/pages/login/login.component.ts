import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class LoginComponent implements OnInit {
guardarCliente() {
throw new Error('Method not implemented.');
}
  loginData = {
    username: '',
    password: '',
  };
  hide: boolean = true;
  mensajeError: string = '';

  // Para carrusel de info-side
  currentInfoSlide: number = 0;

  constructor(
    private snack: MatSnackBar,
    private loginService: LoginService,
    private router: Router,

  ) {}

  ngOnInit(): void {}

  setInfoSlide(index: number) {
    this.currentInfoSlide = index;
  }

formSubmit() {
  if (this.loginData.username.trim() === '' || this.loginData.username.trim() == null) {
    this.snack.open('El nombre de usuario es requerido', 'Aceptar', { duration: 3000 });
    return;
  }

  if (this.loginData.password.trim() === '' || this.loginData.password.trim() == null) {
    this.snack.open('La contraseña es requerida', 'Aceptar', { duration: 3000 });
    return;
  }

this.loginService.generarToken(this.loginData).subscribe(
  (data: any) => {
    this.loginService.loginUser(data.token);
    this.loginService.setRol(data.rol);

    // Guarda todo el usuario en localStorage
    this.loginService.setUser(data.usuario);

    console.log('Sucursal ID:', data.usuario.sucursal.idSucursal);

    this.snack.open('Inicio de sesión exitoso', 'Aceptar', { duration: 3000 });
    this.router.navigate(['admin']);
  },
    (error) => {
      if (error.error.error === 'USUARIO DESHABILITADO') {
        Swal.fire({
          icon: 'error',
          title: 'Usuario deshabilitado',
          text: 'Su cuenta ha sido deshabilitada. Por favor, contacte con el administrador.',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales inválidas',
          text: 'Por favor, verifique su usuario y contraseña.',
          confirmButtonText: 'Aceptar',
        });
      }
    }
  );
}

}
