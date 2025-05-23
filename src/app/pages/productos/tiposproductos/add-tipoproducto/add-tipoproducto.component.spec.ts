import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTipoproductoComponent } from './add-tipoproducto.component';

describe('AddTipoproductoComponent', () => {
  let component: AddTipoproductoComponent;
  let fixture: ComponentFixture<AddTipoproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTipoproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTipoproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
