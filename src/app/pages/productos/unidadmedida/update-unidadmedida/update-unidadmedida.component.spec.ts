import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUnidadmedidaComponent } from './update-unidadmedida.component';

describe('UpdateUnidadmedidaComponent', () => {
  let component: UpdateUnidadmedidaComponent;
  let fixture: ComponentFixture<UpdateUnidadmedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateUnidadmedidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateUnidadmedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
