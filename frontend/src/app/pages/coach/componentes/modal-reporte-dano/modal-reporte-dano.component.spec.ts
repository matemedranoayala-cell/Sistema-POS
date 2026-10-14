import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReporteDanoComponent } from './modal-reporte-dano.component';

describe('ModalReporteDanoComponent', () => {
  let component: ModalReporteDanoComponent;
  let fixture: ComponentFixture<ModalReporteDanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalReporteDanoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReporteDanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
