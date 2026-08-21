import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueManagerComponent } from './league-manager.component';

describe('LeagueManagerComponent', () => {
  let component: LeagueManagerComponent;
  let fixture: ComponentFixture<LeagueManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
