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

export const routes: Routes = [
  { path: '', component: LogoDisplayComponent },
  { path: 'misc', component: MiscDisplayComponent },
  { path: 'suggest', component: LogoSuggestionComponent },
  { path: 'manage-tags', component: TagManagerComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'games', component: GamesComponent },
  { path: 'quiz', component: QuizMenuComponent },
  { path: 'quiz/game', component: QuizGameComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'collections/:id', component: CollectionDetailComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'collections', pathMatch: 'full' },
      { path: 'collections', component: AdminCollectionManagerComponent },
      { path: 'tags', component: TagManagerComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];