import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAperturaComponent } from './add-apertura.component';

describe('AddAperturaComponent', () => {
  let component: AddAperturaComponent;
  let fixture: ComponentFixture<AddAperturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAperturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
