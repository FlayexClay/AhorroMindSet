import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  svgPath: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = signal(true);
  toggleCollapsed = output<boolean>();

  toggle() {
    this.collapsed.update(v => !v);
    this.toggleCollapsed.emit(this.collapsed());
  }

  readonly navItems: NavItem[] = [
    {
      icon: 'home',
      label: 'Inicio',
      route: '/dashboard',
      svgPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
    },
    {
      icon: 'realizar',
      label: 'Realizar Ahorro',
      route: '/dashboard/realizar-ahorro',
      svgPath: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'
    },
    {
      icon: 'fechas',
      label: 'Fechas',
      route: '/dashboard/fechas',
      svgPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      icon: 'plan',
      label: 'Plan Ahorro',
      route: '/dashboard/plan-ahorro',
      svgPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
  ]
}
