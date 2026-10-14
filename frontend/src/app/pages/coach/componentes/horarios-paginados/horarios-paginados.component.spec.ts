import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosPaginadosComponent } from './horarios-paginados.component';

describe('HorariosPaginadosComponent', () => {
  let component: HorariosPaginadosComponent;
  let fixture: ComponentFixture<HorariosPaginadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosPaginadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorariosPaginadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
