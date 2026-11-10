import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { LoginService } from '../../service/login.service';
import { SucursalesService } from '../../service/sucursales.service';

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
    RouterLink,
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

  remember = true;

  currentInfoSlide: number = 0;
  slides = [
    {
      image: 'assets/img/login/slide1.jpg',
      badge: 'Punto de venta rápido',
      title: 'Cobros ágiles en caja sin demoras',
      subtitle: 'Diseñado para el ritmo de minimarkets y bodegas',
      description: 'Escaneo instantáneo de códigos de barra, balanza electrónica para embutidos y frutas al peso, y cobros inmediatos con Efectivo, Yape, Plin y tarjetas.',
    },
    {
      image: 'assets/img/login/slide2.jpg',
      badge: 'Control de inventario',
      title: 'Stock siempre actualizado',
      subtitle: 'Sin sorpresas en tus estantes',
      description: 'Mantén el stock de tus productos al día y recibe alertas automáticas cuando un artículo esté por agotarse.',
    },
    {
      image: 'assets/img/login/slide3.jpg',
      badge: 'Gestión de caja',
      title: 'Cierres de caja exactos',
      subtitle: 'Cada sol bajo control',
      description: 'Apertura, movimientos y cierre de caja con el detalle de cada transacción y método de pago.',
    },
    {
      image: 'assets/img/login/slide4.jpg',
      badge: 'Reportes',
      title: 'Decide con datos en tiempo real',
      subtitle: 'Ventas, compras y utilidades',
      description: 'Analiza el desempeño de tu negocio con reportes gráficos y personalizados.',
    },
  ];

  constructor(
    private loginService: LoginService,
    private router: Router,
    private sucursalesService:SucursalesService

  ) {}

  ngOnInit(): void {
    const recordado = this.loginService.usuarioRecordado();
    if (recordado) this.loginData.username = recordado;
  }

  proximamente(red: string) {
    Swal.fire({
      icon: 'info',
      title: 'Próximamente',
      text: `El inicio de sesión con ${red} estará disponible en una próxima versión. Por ahora ingresa con tu usuario y contraseña.`,
      confirmButtonText: 'Entendido'
    });
  }

  registroNoDisponible() {
    Swal.fire({
      icon: 'info',
      title: 'Próximamente',
      text: 'El registro en línea de minimarkets estará disponible en una próxima versión. Por ahora, tu cuenta la crea el administrador de la plataforma.',
      confirmButtonText: 'Entendido'
    });
  }

  setInfoSlide(index: number) {
    this.currentInfoSlide = index;
  }

  nextSlide() {
    this.currentInfoSlide = (this.currentInfoSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentInfoSlide = (this.currentInfoSlide - 1 + this.slides.length) % this.slides.length;
  }

formSubmit() {
  if (this.loginData.username.trim() === '' || this.loginData.username.trim() == null) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: 'El nombre de usuario es requerido', confirmButtonText: 'Aceptar' });
    return;
  }

  if (this.loginData.password.trim() === '' || this.loginData.password.trim() == null) {
    Swal.fire({ icon: 'warning', title: 'Atención', text: 'La contraseña es requerida', confirmButtonText: 'Aceptar' });
    return;
  }

  this.loginService.generarToken(this.loginData).subscribe(
    (data: any) => {
      this.loginService.recordarSesion(this.remember, this.loginData.username.trim());
      this.loginService.loginUser(data.token);
      this.loginService.setRol(data.rol);
      this.loginService.setUser(data.usuario);

      const idSucursal = data.usuario?.sucursal?.idSucursal;

      if (!idSucursal) {
        localStorage.removeItem('empresa');
        this.router.navigate(['admin']);
        return;
      }

      this.sucursalesService.obtenerEmpresPorSucursal(idSucursal).subscribe(
        (empresa) => {
          console.log("Empresa cargada:", empresa);

          localStorage.setItem('empresa', JSON.stringify(empresa));

          this.router.navigate(['admin']);
        },
        (error) => {
          console.error("Error al cargar empresa:", error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Error cargando datos de empresa', confirmButtonText: 'Aceptar' });
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
