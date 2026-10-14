import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFirmaClaseComponent } from './modal-firma-clase.component';

describe('ModalFirmaClaseComponent', () => {
  let component: ModalFirmaClaseComponent;
  let fixture: ComponentFixture<ModalFirmaClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFirmaClaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFirmaClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
