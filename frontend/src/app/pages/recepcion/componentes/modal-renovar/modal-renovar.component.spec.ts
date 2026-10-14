import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenovarComponent } from './modal-renovar.component';

describe('ModalRenovarComponent', () => {
  let component: ModalRenovarComponent;
  let fixture: ComponentFixture<ModalRenovarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRenovarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRenovarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
