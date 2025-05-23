import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUnidadmedidaComponent } from './list-unidadmedida.component';

describe('ListUnidadmedidaComponent', () => {
  let component: ListUnidadmedidaComponent;
  let fixture: ComponentFixture<ListUnidadmedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUnidadmedidaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUnidadmedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
