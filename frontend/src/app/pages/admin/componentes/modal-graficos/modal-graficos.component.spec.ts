import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGraficosComponent } from './modal-graficos.component';

describe('ModalGraficosComponent', () => {
  let component: ModalGraficosComponent;
  let fixture: ComponentFixture<ModalGraficosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalGraficosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
