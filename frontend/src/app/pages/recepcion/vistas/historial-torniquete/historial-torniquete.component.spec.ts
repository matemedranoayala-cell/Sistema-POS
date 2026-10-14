import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialTorniqueteComponent } from './historial-torniquete.component';

describe('HistorialTorniqueteComponent', () => {
  let component: HistorialTorniqueteComponent;
  let fixture: ComponentFixture<HistorialTorniqueteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialTorniqueteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialTorniqueteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
