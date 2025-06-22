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
    private router: Router
  ) {}

  ngOnInit(): void {}

  setInfoSlide(index: number) {
    this.currentInfoSlide = index;
  }

  formSubmit() {
    if (this.loginData.username.trim() === '' || this.loginData.username.trim() == null) {
      this.snack.open('El nombre de usuario es requerido', 'Aceptar', {
        duration: 3000,
      });
      return;
    }

    if (this.loginData.password.trim() === '' || this.loginData.password.trim() == null) {
      this.snack.open('La contraseña es requerida', 'Aceptar', {
        duration: 3000,
      });
      return;
    }

    this.loginService.generarToken(this.loginData).subscribe(
      (data: any) => {
        this.loginService.loginUser(data.token);
        console.log(data.token);

        this.loginService.getCurrentUser().subscribe(
          (user: any) => {
            this.loginService.setUser(user);
            if (!user.enabled) {
              Swal.fire({
                icon: 'error',
                title: 'Usuario deshabilitado',
                text: 'Su cuenta está deshabilitada. Contacte al administrador.',
                confirmButtonText: 'Aceptar',
              });
              localStorage.clear();
              return;
            }
            if (!user.rol.estado) {
              Swal.fire({
                icon: 'error',
                title: 'Rol deshabilitado',
                text: 'El rol asignado a su cuenta está deshabilitado. Contacte al administrador.',
                confirmButtonText: 'Aceptar',
              });
              localStorage.clear();
              return;
            }
            this.router.navigate(['admin']);
          },
          (error) => {
            console.log(error);
            Swal.fire({
              icon: 'error',
              title: 'Error al obtener datos del usuario',
              text: 'No se pudo obtener la información del usuario.',
              confirmButtonText: 'Aceptar',
            });
          }
        );
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
