import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMisHorariosComponent } from './modal-mis-horarios.component';

describe('ModalMisHorariosComponent', () => {
  let component: ModalMisHorariosComponent;
  let fixture: ComponentFixture<ModalMisHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMisHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalMisHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
