import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoDisplayComponent } from './logo-display.component';

describe('LogoDisplayComponent', () => {
  let component: LogoDisplayComponent;
  let fixture: ComponentFixture<LogoDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
