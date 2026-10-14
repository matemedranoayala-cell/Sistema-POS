import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioCoachComponent } from './inicio-coach.component';

describe('InicioCoachComponent', () => {
  let component: InicioCoachComponent;
  let fixture: ComponentFixture<InicioCoachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioCoachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
