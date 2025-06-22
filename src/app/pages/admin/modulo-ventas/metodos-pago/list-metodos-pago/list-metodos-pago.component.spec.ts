import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMetodosPagoComponent } from './list-metodos-pago.component';

describe('ListMetodosPagoComponent', () => {
  let component: ListMetodosPagoComponent;
  let fixture: ComponentFixture<ListMetodosPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMetodosPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMetodosPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
