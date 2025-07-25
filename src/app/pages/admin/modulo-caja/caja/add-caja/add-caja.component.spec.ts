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
