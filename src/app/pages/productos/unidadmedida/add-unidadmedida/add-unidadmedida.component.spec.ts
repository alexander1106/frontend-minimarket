import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUnidadmedidaComponent } from './add-unidadmedida.component';

describe('AddUnidadmedidaComponent', () => {
  let component: AddUnidadmedidaComponent;
  let fixture: ComponentFixture<AddUnidadmedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUnidadmedidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUnidadmedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
