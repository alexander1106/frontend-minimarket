import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-enviar-correo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recuperar-clave.component.html',
  styleUrl: './recuperar-clave.component.css'
})
export class EnviarCorreoComponent {
  email = '';
  enviando = false;

  constructor(private loginService: LoginService) {}

  enviar(): void {
    if (!this.email.trim()) {
      Swal.fire('Atención', 'Ingresa tu correo', 'warning');
      return;
    }
    this.enviando = true;
    // El backend responde 200 siempre, exista o no el correo
    this.loginService.enviarEmail(this.email.trim()).subscribe({
      next: () => {
        this.enviando = false;
        Swal.fire('Revisa tu correo', 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.', 'success');
      },
      error: () => {
        this.enviando = false;
        Swal.fire('Error', 'No se pudo enviar el correo. Inténtalo más tarde.', 'error');
      }
    });
  }
}
