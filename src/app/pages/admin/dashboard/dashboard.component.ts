import { Component } from '@angular/core';
import { BarraLateralComponent } from '../../../components/barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [BarraLateralComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
