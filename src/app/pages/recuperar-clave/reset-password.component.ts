import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './recuperar-clave.component.css'
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  nuevaClave = '';
  confirmar = '';
  enviando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  guardar(): void {
    if (!this.token) {
      Swal.fire('Enlace inválido', 'El enlace de recuperación no es válido.', 'error');
      return;
    }
    if (this.nuevaClave.length < 6) {
      Swal.fire('Atención', 'La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (this.nuevaClave !== this.confirmar) {
      Swal.fire('Atención', 'Las contraseñas no coinciden', 'warning');
      return;
    }
    this.enviando = true;
    this.loginService.resetPassword(this.token, this.nuevaClave).subscribe({
      next: () => {
        this.enviando = false;
        Swal.fire('Listo', 'Tu contraseña fue actualizada. Inicia sesión.', 'success')
          .then(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        this.enviando = false;
        // Errores 400 con texto: "Token inválido", "Token expirado"
        const e = err?.error;
        const msg = (typeof e === 'string' && e.trim()) ? e : (e?.error || e?.message);
        Swal.fire('Error', msg || 'No se pudo cambiar la contraseña', 'error');
      }
    });
  }
}
