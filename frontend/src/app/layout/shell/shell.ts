import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth.service';
import { FestivalEventService } from '../../features/festival-events/festival-event.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  // Shared signal: stays in sync automatically whenever the active year is
  // changed anywhere in the app (e.g. the Festival Years admin page).
  activeYear;

  private static readonly COLLAPSE_KEY = 'sidebarCollapsed';
  private readonly breakpoints = inject(BreakpointObserver);
  protected readonly isMobile = toSignal(
    this.breakpoints.observe('(max-width: 1024px)').pipe(map((state) => state.matches)),
    { initialValue: false }
  );
  protected readonly collapsed = signal(localStorage.getItem(Shell.COLLAPSE_KEY) === 'true');
  protected readonly mobileOpen = signal(false);

  constructor(public auth: AuthService, private router: Router, private festivalEventService: FestivalEventService) {
    this.activeYear = this.festivalEventService.activeEvent;
  }

  ngOnInit(): void {
    this.festivalEventService.refreshActive();
  }

  protected toggleMenu(): void {
    if (this.isMobile()) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
      localStorage.setItem(Shell.COLLAPSE_KEY, String(this.collapsed()));
    }
  }

  protected onNavigate(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
