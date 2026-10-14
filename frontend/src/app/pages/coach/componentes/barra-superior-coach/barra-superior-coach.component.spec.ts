import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraSuperiorCoachComponent } from './barra-superior-coach.component';

describe('BarraSuperiorCoachComponent', () => {
  let component: BarraSuperiorCoachComponent;
  let fixture: ComponentFixture<BarraSuperiorCoachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraSuperiorCoachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraSuperiorCoachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
