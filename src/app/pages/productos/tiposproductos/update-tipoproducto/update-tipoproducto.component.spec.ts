import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTipoproductoComponent } from './update-tipoproducto.component';

describe('UpdateTipoproductoComponent', () => {
  let component: UpdateTipoproductoComponent;
  let fixture: ComponentFixture<UpdateTipoproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTipoproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTipoproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
