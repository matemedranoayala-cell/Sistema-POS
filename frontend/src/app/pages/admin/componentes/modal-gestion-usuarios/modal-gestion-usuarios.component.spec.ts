import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGestionUsuariosComponent } from './modal-gestion-usuarios.component';

describe('ModalGestionUsuariosComponent', () => {
  let component: ModalGestionUsuariosComponent;
  let fixture: ComponentFixture<ModalGestionUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalGestionUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGestionUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
