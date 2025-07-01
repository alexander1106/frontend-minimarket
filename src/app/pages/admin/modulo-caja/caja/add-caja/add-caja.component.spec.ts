<<<<<<< HEAD:src/app/pages/admin/modulo-caja/caja/add-caja/add-caja.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCajaComponent } from './add-caja.component';

describe('AddCajaComponent', () => {
  let component: AddCajaComponent;
  let fixture: ComponentFixture<AddCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVentasComponent } from './add-ventas.component';

describe('AddVentasComponent', () => {
  let component: AddVentasComponent;
  let fixture: ComponentFixture<AddVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVentasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c:src/app/pages/admin/modulo-ventas/ventas/add-ventas/add-ventas.component.spec.ts
