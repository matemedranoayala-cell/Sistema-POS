import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalArqueoComponent } from './modal-arqueo.component';

describe('ModalArqueoComponent', () => {
  let component: ModalArqueoComponent;
  let fixture: ComponentFixture<ModalArqueoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalArqueoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalArqueoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
