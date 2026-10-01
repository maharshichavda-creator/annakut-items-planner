import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth.guard';
import { Shell } from './layout/shell/shell';
import { Login } from './features/login/login';
import { Items } from './features/items/items';
import { Haribhakts } from './features/haribhakts/haribhakts';
import { Allocations } from './features/allocations/allocations';
import { FestivalEvents } from './features/festival-events/festival-events';
import { Users } from './features/users/users';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'items' },
      { path: 'items', component: Items },
      { path: 'haribhakts', component: Haribhakts },
      { path: 'allocations', component: Allocations },
      { path: 'festival-years', component: FestivalEvents, canActivate: [roleGuard(['ADMIN'])] },
      { path: 'users', component: Users, canActivate: [roleGuard(['ADMIN'])] },
    ],
  },
  { path: '**', redirectTo: '' },
];
