<<<<<<< HEAD:src/app/pages/admin/modulo-caja/apertura/list-apertura/list-apertura.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAperturaComponent } from './list-apertura.component';

describe('ListAperturaComponent', () => {
  let component: ListAperturaComponent;
  let fixture: ComponentFixture<ListAperturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAperturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListClientesComponent } from './list-clientes.component';

describe('ListClientesComponent', () => {
  let component: ListClientesComponent;
  let fixture: ComponentFixture<ListClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListClientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
>>>>>>> 058cbc6a4c9021a15fe40018b006294083b61c7c:src/app/pages/admin/modulo-ventas/clientes/list-clientes/list-clientes.component.spec.ts
