import { Routes } from '@angular/router';
import { LogoDisplayComponent } from './components/logo-display/logo-display.component';
import { LogoSuggestionComponent } from './components/logo-suggestion/logo-suggestion.component';
import { MiscDisplayComponent } from './components/misc-display/misc-display.component';
import { TagManagerComponent } from './components/tag-manager/tag-manager.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';

export const routes: Routes = [
  { path: '', component: LogoDisplayComponent },
  { path: 'misc', component: MiscDisplayComponent },
  { path: 'suggest', component: LogoSuggestionComponent },
  { path: 'manage-tags', component: TagManagerComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: '**', redirectTo: '' }
];