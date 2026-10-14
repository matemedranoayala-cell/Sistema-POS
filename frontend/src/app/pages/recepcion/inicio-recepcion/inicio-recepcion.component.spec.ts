import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioRecepcionComponent } from './inicio-recepcion.component';

describe('InicioRecepcionComponent', () => {
  let component: InicioRecepcionComponent;
  let fixture: ComponentFixture<InicioRecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioRecepcionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
