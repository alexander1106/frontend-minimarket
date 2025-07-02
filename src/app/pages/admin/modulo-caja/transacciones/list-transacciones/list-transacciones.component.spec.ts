import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTransaccionesComponent } from './list-transacciones.component';

describe('ListTransaccionesComponent', () => {
  let component: ListTransaccionesComponent;
  let fixture: ComponentFixture<ListTransaccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTransaccionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTransaccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
