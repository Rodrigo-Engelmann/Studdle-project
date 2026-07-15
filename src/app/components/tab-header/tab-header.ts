// angular
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

// other
import { filter } from 'rxjs';

// services
import { UserService } from '../../services/users/users.service';

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
    MatButtonModule
  ],
  templateUrl: 'tab-header.html',
  styleUrls: [
    './tab-header.scss',
    '../videos/videos.scss'
  ]
})
export class TabHeader implements OnInit {
  profile_picture: any = undefined;
  selectedIndex: number = 0;

  routes: any[] = [
    'recomendacoes',
    'videos',
    'materiais',
    'engine'
  ];

  // filtros
  showFilters: boolean = false;
  searchQuery: string = '';

  modules: string[] = [
    'nenhum',
    'Módulo 1',
    'Módulo 2',
    'Módulo 3'
  ];

  categories: string[] = [
    'nenhum',
    'UI/UX',
    'Backend',
    'Frontend'
  ];

  selectedModule: string | null = null;
  selectedCategory: string | null = null;

  pagesConfig: any[] = [
    { page: 'recomendacoes', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'videos', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'materiais', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null },
    { page: 'engine', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null }
  ];

  search_header: HTMLElement | null = null;

  constructor(
    private router: Router,
    private userService: UserService
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
      default:
          this.selectedIndex = 0;
    }
  }

  ngOnInit() {
    const url = this.router.url.replace('/', '');
    this.selectedIndex = this.routes.indexOf(url);

    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;
      },
      error: (err) => {
        console.error("Erro ao buscar perfil:", err);

        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  ngAfterViewInit() {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;
    if (this.search_header) this.search_header.style.zIndex = '1012312';

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
    this.router.navigate(['/', this.routes[index]]);
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
    console.log('-- filtro+search: ', this.searchQuery, this.selectedModule, this.selectedCategory);
  }

  showFilterUpdate() {
    this.showFilters = !this.showFilters;
    this.filterConfigUpdate();
  }

  // sistema de popup do profile-picture
  Configuracoes() {
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    this.userService.logout().subscribe({
      next: () => {
        console.log("Logout realizado com sucesso!");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("Erro ao fazer logout:", err);
      }
    });
  }
}