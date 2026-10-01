import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
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
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  // Shared signal: stays in sync automatically whenever the active year is
  // changed anywhere in the app (e.g. the Festival Years admin page).
  activeYear;

  constructor(public auth: AuthService, private router: Router, private festivalEventService: FestivalEventService) {
    this.activeYear = this.festivalEventService.activeEvent;
  }

  ngOnInit(): void {
    this.festivalEventService.refreshActive();
  }

  logout(): void {
    this.auth.logout();
  }
}
