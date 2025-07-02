import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComprasComponent } from './list-compras.component';

describe('ListComprasComponent', () => {
  let component: ListComprasComponent;
  let fixture: ComponentFixture<ListComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
