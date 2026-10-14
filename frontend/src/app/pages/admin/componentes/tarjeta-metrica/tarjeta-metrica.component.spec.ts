import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaMetricaComponent } from './tarjeta-metrica.component';

describe('TarjetaMetricaComponent', () => {
  let component: TarjetaMetricaComponent;
  let fixture: ComponentFixture<TarjetaMetricaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaMetricaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetaMetricaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
