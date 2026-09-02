import { Routes } from '@angular/router';
import { LogoDisplayComponent } from './components/logo-display/logo-display.component';
import { MiscDisplayComponent } from './components/misc-display/misc-display.component';
import { LogoSuggestionComponent } from './components/logo-suggestion/logo-suggestion.component';
import { TagManagerComponent } from './components/tag-manager/tag-manager.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { QuizMenuComponent } from './components/quiz-menu/quiz-menu.component';
import { QuizGameComponent } from './components/quiz-game/quiz-game.component';
import { GamesComponent } from './components/games/games.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { CollectionDetailComponent } from './components/collection-detail/collection-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminCollectionManagerComponent } from './components/admin-collection-manager/admin-collection-manager.component';
import { AdminGuard } from './guards/admin.guard';
import { InteractiveMapComponent } from './components/interactive-map/interactive-map.component';
import { AdminStadiumManagerComponent } from './components/admin-stadium-manager/admin-stadium-manager.component';

export const routes: Routes = [
  { path: '', component: LogoDisplayComponent },
  { path: 'misc', component: MiscDisplayComponent },
  { path: 'suggest', component: LogoSuggestionComponent },
  { path: 'manage-tags', component: TagManagerComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'games', component: GamesComponent },
  { path: 'quiz', component: QuizMenuComponent },
  { path: 'quiz/game', component: QuizGameComponent },
  { path: 'map', component: InteractiveMapComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'collections/:id', component: CollectionDetailComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'collections', pathMatch: 'full' },
      { path: 'collections', component: AdminCollectionManagerComponent },
      { path: 'teams', loadComponent: () => import('./components/admin-team-manager/admin-team-manager.component').then(m => m.AdminTeamManagerComponent) },
      { path: 'stadiums', component: AdminStadiumManagerComponent },
      { path: 'tags', component: TagManagerComponent },
      { path: 'leagues', loadComponent: () => import('./components/league-manager/league-manager.component').then(m => m.LeagueManagerComponent) }
    ]
  },
  { path: 'team/:id/history', loadComponent: () => import('./components/team-history/team-history.component').then(m => m.TeamHistoryComponent) },
  { path: '**', redirectTo: '' }
];
