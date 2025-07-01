import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAperturaComponent } from './list-apertura.component';

describe('ListAperturaComponent', () => {
  let component: ListAperturaComponent;
  let fixture: ComponentFixture<ListAperturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAperturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
