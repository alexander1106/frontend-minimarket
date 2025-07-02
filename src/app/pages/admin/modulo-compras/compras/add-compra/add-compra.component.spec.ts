import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompraComponent } from './add-compra.component';

describe('AddCompraComponent', () => {
  let component: AddCompraComponent;
  let fixture: ComponentFixture<AddCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCompraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
