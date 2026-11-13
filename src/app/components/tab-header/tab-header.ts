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
    'progression',
    'video',
    'view'
  ];

  // filtros
  showFilters: boolean = false;
  filtersPageLock: boolean = false;
  searchQuery: string = '';
  selectedModule: any | null = null;
  selectedCategory: any | null = null;
  // outro
  color_scheme: number = 1;

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
      this.filtersPageLock = false;
      const url = this.router.url.split('/')[1];
      let urlIndex: number = this.routes.indexOf(url);
      if (urlIndex === 5) {
        urlIndex = 1;
        this.filtersPageLock = true;
      }
      else if (urlIndex === 6) {
        urlIndex = 2;
        this.filtersPageLock = true;
      }
      
      this.selectedIndex = urlIndex;
    });
  }

  ngOnInit(): void {
      const url = this.router.url.split('/')[1];
      let urlIndex: number = this.routes.indexOf(url);
      if (urlIndex === 5) {
        urlIndex = 1;
        this.filtersPageLock = true;
      }
      else if (urlIndex === 6) {
        urlIndex = 2;
        this.filtersPageLock = true;
      }
      
      this.selectedIndex = urlIndex;

    this.userService.getProfile().subscribe({
      next: (res) => {
        this.userId = res.user.id;
        this.loadUnreadCount();

        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;

        this.userService.updateColorScheme(res.user.color_scheme??1);
        this.color_scheme = res.user.color_scheme;
      },
      error: (err) => {
        console.error("failed to find profile:", err);

        if (err.status === 401)
          this.router.navigate(['/login']);
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

  ngAfterViewInit(): void {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;

    const header = document.querySelector('app-tab-header') as HTMLElement;
    if (header) {
      header.style.width = '100%';
      header.style.display = 'block';
    }

    const page_container = document.getElementsByClassName('.page-container')[0] as HTMLElement;
    if (page_container) page_container.style.height = '100%';
  }

  go(index: number): void {
    this.resetFilterComponent(index);
    this.selectedIndex = index;
    
    this.router.navigate(['/', this.routes[index]]);

    this.updateUserData.emit(true);
  }

  resetFilterComponent(index: any): void {
    this.showFilters = this.pagesConfig[index].showFilters;
    this.searchQuery = this.pagesConfig[index].searchQuery;
    this.selectedModule = this.pagesConfig[index].selectedModule;
    this.selectedCategory = this.pagesConfig[index].selectedCategory;
  }

  filterConfigUpdate(): void {
    this.pagesConfig[this.selectedIndex].showFilters = this.showFilters;
    this.pagesConfig[this.selectedIndex].searchQuery = this.searchQuery;
    this.pagesConfig[this.selectedIndex].selectedCategory = this.selectedCategory;
    this.pagesConfig[this.selectedIndex].selectedModule = this.selectedModule;
  }

  searchUpdate(): void {
    this.filterConfigUpdate();
    const filters: any = {
      searchQuery: this.searchQuery,
      selectedModule: this.selectedCategory,
      selectedCategory: !this.selectedCategory || this.selectedCategory.id === -1 ? null : this.selectedModule,
      pageIndex: this.selectedIndex,
    };
    this.filterChanges.emit(filters);
  }

  showFilterUpdate(): void {
    this.showFilters = !this.showFilters;
    this.filterConfigUpdate();
  }

  // sistema de popup do profile-picture
  Configuracoes(): void {
    const url = `/userConfigs/${this.selectedIndex}`;
    this.router.navigate([url]);
    this.updateUserData.emit(true);
  }

  Logout(): void {
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