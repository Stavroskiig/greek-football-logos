import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { LogoSuggestionService } from '../../services/logo-suggestion.service';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';
import { League } from '../../models/league';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-logo-suggestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './logo-suggestion.component.html'
})
export class LogoSuggestionComponent implements OnInit, OnDestroy {
  suggestionForm: FormGroup;
  isSubmitting = false;
  submitErrorKey: string | null = null;
  submitSuccessKey: string | null = null;

  // Club Mode: 'EXISTING' or 'NEW'
  clubMode: 'EXISTING' | 'NEW' = 'EXISTING';
  selectedTeam: Team | null = null;
  teamSearchTerm: string = '';
  searchResults: Team[] = [];
  isSearchingTeams = false;

  availableLeagues: League[] = [];

  private teamSearchSubject = new Subject<string>();
  private teamSearchSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private suggestionService: LogoSuggestionService,
    private teamService: TeamService
  ) {
    this.suggestionForm = this.fb.group({
      teamName: ['', Validators.required],
      teamId: [''],
      eps: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      url: ['', [Validators.required, this.urlValidator()]]
    });
  }

  ngOnInit(): void {
    this.setupTeamSearch();
    this.loadLeagues();
  }

  ngOnDestroy(): void {
    if (this.teamSearchSub) {
      this.teamSearchSub.unsubscribe();
    }
  }

  private loadLeagues(): void {
    this.teamService.getLeagues().pipe(
      catchError(() => of([]))
    ).subscribe(leagues => {
      this.availableLeagues = leagues || [];
    });
  }

  private setupTeamSearch(): void {
    this.teamSearchSub = this.teamSearchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((term: string) => {
        const clean = term.trim();
        if (!clean) {
          this.isSearchingTeams = false;
          return of({ content: [] });
        }
        this.isSearchingTeams = true;
        return this.teamService.getTeams(undefined, clean, 0, 10).pipe(
          catchError(() => of({ content: [] }))
        );
      })
    ).subscribe({
      next: (page: any) => {
        this.searchResults = page.content || [];
        this.isSearchingTeams = false;
      },
      error: () => {
        this.isSearchingTeams = false;
      }
    });
  }

  setClubMode(mode: 'EXISTING' | 'NEW'): void {
    this.clubMode = mode;
    this.clearSelectedTeam();
  }

  onTeamSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value || '';
    this.teamSearchTerm = term;
    this.teamSearchSubject.next(term);
  }

  selectTeam(team: Team): void {
    this.selectedTeam = team;
    this.searchResults = [];
    this.teamSearchTerm = '';
    const leagueName = team.league?.name || '';
    this.suggestionForm.patchValue({
      teamName: team.name,
      teamId: team.id,
      eps: leagueName
    });
  }

  clearSelectedTeam(): void {
    this.selectedTeam = null;
    this.teamSearchTerm = '';
    this.searchResults = [];
    this.suggestionForm.patchValue({
      teamName: '',
      teamId: '',
      eps: ''
    });
  }

  get teamName() { return this.suggestionForm.get('teamName')!; }
  get eps() { return this.suggestionForm.get('eps')!; }
  get senderEmail() { return this.suggestionForm.get('senderEmail')!; }
  get url() { return this.suggestionForm.get('url')!; }

  isValidUrl(url: string): boolean {
    const urlPattern = /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|webp)$/i;
    return urlPattern.test(url);
  }

  urlValidator() {
    return (control: any): { [key: string]: any } | null => {
      const url = control.value;
      if (!url) {
        return { 'required': true };
      }
      if (!this.isValidUrl(url)) {
        return { 'invalidUrl': true };
      }
      return null;
    };
  }

  isFormValid(): boolean {
    if (this.clubMode === 'EXISTING' && !this.selectedTeam) {
      return false;
    }
    return this.suggestionForm.valid;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;
    this.submitErrorKey = null;
    this.submitSuccessKey = null;

    try {
      const formData = new FormData();
      formData.append('teamName', this.teamName.value.trim());
      formData.append('eps', this.eps.value.trim());
      formData.append('senderEmail', this.senderEmail.value.trim());
      formData.append('url', this.url.value.trim());
      formData.append('isNewTeam', this.clubMode === 'NEW' ? 'true' : 'false');
      if (this.clubMode === 'EXISTING' && this.selectedTeam?.id) {
        formData.append('teamId', this.selectedTeam.id);
      }
      formData.append('hasUrl', 'true');
      formData.append('hasFile', 'false');

      await this.suggestionService.submitSuggestion(formData).toPromise();

      // Reset form after successful submission
      this.suggestionForm.reset();
      this.clearSelectedTeam();
      this.submitSuccessKey = 'suggest.submit_success';

      setTimeout(() => {
        this.submitSuccessKey = null;
      }, 6000);
    } catch (error) {
      console.error('Error in form submission:', error);
      this.submitErrorKey = 'suggest.submit_error';
    } finally {
      this.isSubmitting = false;
    }
  }
}
