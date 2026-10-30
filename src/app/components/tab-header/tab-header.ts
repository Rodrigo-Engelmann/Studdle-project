// angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

// other
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';

// services
import { UserService } from '../../services/users/users.service';
import { DialogService } from '../../components/services/dialog.service';
import { UserNotificationService } from '../services/user-notifications/user-notifications.service';

@Component({
  selector: 'app-tab-header',
  standalone: true,
  imports: [
    MatTabsModule,
    RouterOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    MatSelectModule,
    MatMenuModule,
    MatButtonModule,
    MatBadgeModule,
    NgClass,
  ],
  templateUrl: 'tab-header.html',
  styleUrls: [
    './tab-header.scss',
    '../videos/videos.scss'
  ]
})
export class TabHeader implements OnInit {
  @Input() progressPercentage: number = 0;
  @Input() modules: any[] = [];
  @Input() categories: any[] = [];

  @Output() filterChanges = new EventEmitter<any>();
  @Output() updateUserData = new EventEmitter<boolean>();

  profile_picture: any = undefined;
  selectedIndex: number = 0;

  routes: any[] = [
    'recomendacoes',
    'videos',
    'materiais',
    'engine',
    'progression'
  ];

  // filtros
  showFilters: boolean = false;
  searchQuery: string = '';

  selectedModule: string | null = null;
  selectedCategory: string | null = null;

  pagesConfig: any[] = [
    { page: 'recomendacoes', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'videos', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'materiais', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'engine', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'progression', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null }
  ];

  search_header: HTMLElement | null = null;

  unreadCount: number = 0;
  private userId: number | null = null;

  constructor(
    private router: Router
    , private userService: UserService
    , private dialogService: DialogService
    , private userNotificationService: UserNotificationService
  ) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      const url = this.router.url.replace('/', '');
      this.selectedIndex = this.routes.indexOf(url);
    });

    switch (this.router.url) {
      case '/videos':
          this.selectedIndex = 1;
          break;
      case '/materiais':
          this.selectedIndex = 2;
          break;
      case '/engine':
          this.selectedIndex = 3;
          break;
      case '/progression':
          this.selectedIndex = 4;
          break;
      default:
          this.selectedIndex = 0;
    }
  }

  ngOnInit() {
    const url = this.router.url.replace('/', '');
    this.selectedIndex = this.routes.indexOf(url);

    this.userService.getProfile().subscribe({
      next: (res) => {
        this.userId = res.user.id;
        this.loadUnreadCount();

        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;

        this.userService.updateColorScheme(res.user.color_scheme??1);
      },
      error: (err) => {
        console.error("failed to find profile:", err);

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadUnreadCount(): void {
    if (!this.userId)
      return;

    this.userNotificationService.countUnread(this.userId).subscribe({
      next: (res) =>
        this.unreadCount = res.total,
      error: (err) =>
        console.error('--Error ao contar notificações: ', err)
    });
  }

  ngAfterViewInit() {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;

    const header = document.querySelector('app-tab-header') as HTMLElement;
    if (header) {
      header.style.width = '100%';
      header.style.display = 'block';
    }

    const page_container = document.getElementsByClassName('.page-container')[0] as HTMLElement;
    if (page_container) page_container.style.height = '100%';
  }

  go(index: number) {
    this.resetFilterComponent(index);
    this.selectedIndex = index;
    this.router.navigate(['/', this.routes[index]]);3

    this.updateUserData.emit(true);
  }

  resetFilterComponent(index: any) {
    this.showFilters = this.pagesConfig[index].showFilters;
    this.searchQuery = this.pagesConfig[index].searchQuery;
    this.selectedModule = this.pagesConfig[index].selectedModule;
    this.selectedCategory = this.pagesConfig[index].selectedCategory;
  }

  filterConfigUpdate() {
    this.pagesConfig[this.selectedIndex].showFilters = this.showFilters;
    this.pagesConfig[this.selectedIndex].searchQuery = this.searchQuery;
    this.pagesConfig[this.selectedIndex].selectedModule = this.selectedModule;
    this.pagesConfig[this.selectedIndex].selectedCategory = this.selectedCategory;
  }

  searchUpdate() {
    this.filterConfigUpdate();
    const filters: any = {
      searchQuery: this.searchQuery,
      selectedModule: this.selectedCategory,
      selectedCategory: this.selectedModule,
      pageIndex: this.selectedIndex,
    };
    this.filterChanges.emit(filters);
  }

  showFilterUpdate() {
    this.showFilters = !this.showFilters;
    this.filterConfigUpdate();
  }

  // sistema de popup do profile-picture
  Configuracoes() {
    this.router.navigate(['/userConfigs']);
    this.updateUserData.emit(true);
  }

  Logout() {
    this.userService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.updateUserData.emit(true);
      },
      error: (err) => {
        console.error("Logout error:", err);
      }
    });
  }

  openNotifications(): void {
    this.dialogService.openNotificationsDialog().subscribe((result) => {
      this.loadUnreadCount();

      if (result.data?.selected?.page_link) {
        this.router.navigateByUrl(result.data.selected.page_link);
        this.updateUserData.emit(true);
      }
    });
  }
}