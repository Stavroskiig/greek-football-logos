import { Routes } from '@angular/router';
import { LogoDisplayComponent } from './components/logo-display/logo-display.component';
import { LogoSuggestionComponent } from './components/logo-suggestion/logo-suggestion.component';

export const routes: Routes = [
  { path: '', component: LogoDisplayComponent },
  { path: 'suggest', component: LogoSuggestionComponent },
  { path: '**', redirectTo: '' }
];