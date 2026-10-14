import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNuevoAlumnoComponent } from './modal-nuevo-alumno.component';

describe('ModalNuevoAlumnoComponent', () => {
  let component: ModalNuevoAlumnoComponent;
  let fixture: ComponentFixture<ModalNuevoAlumnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNuevoAlumnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNuevoAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
