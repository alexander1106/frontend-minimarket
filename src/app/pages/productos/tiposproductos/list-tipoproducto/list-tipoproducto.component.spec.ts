import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTipoproductoComponent } from './list-tipoproducto.component';

describe('ListTipoproductoComponent', () => {
  let component: ListTipoproductoComponent;
  let fixture: ComponentFixture<ListTipoproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTipoproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTipoproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
