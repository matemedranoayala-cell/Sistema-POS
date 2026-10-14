import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaAccionComponent } from './tarjeta-accion.component';

describe('TarjetaAccionComponent', () => {
  let component: TarjetaAccionComponent;
  let fixture: ComponentFixture<TarjetaAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaAccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetaAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
