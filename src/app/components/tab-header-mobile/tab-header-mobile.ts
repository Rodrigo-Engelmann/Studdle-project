// angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';

// ionic framework
import { addIcons } from 'ionicons';
import { IonHeader, IonToolbar, IonContent, IonFooter, IonTabButton, IonIcon, IonInput, IonSelectOption, IonSelect, IonButton } from '@ionic/angular/standalone';
import { homeOutline, playCircleOutline, documentTextOutline, hardwareChipOutline, downloadOutline, filterOutline, searchOutline, cogOutline, logOutOutline, personOutline, notificationsOutline } from 'ionicons/icons';

// services
import { UserNotificationService } from '../services/user-notifications/user-notifications.service';
import { UserService } from '../../services/users/users.service';
import { DialogService } from '../../components/services/dialog.service';

// outro
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-tab-header-mobile',
    standalone: true,
    imports: [
        CommonModule
        , RouterOutlet
        , MatIconModule
        , NgClass

        , IonHeader
        , IonToolbar
        , IonContent
        , IonFooter
        , IonTabButton
        , IonIcon
        , IonInput
        , FormsModule
        , IonSelectOption
        , IonSelect
        , IonButton

        , MatMenuModule
        , MatButtonModule
        , MatBadgeModule
    ],
    templateUrl: './tab-header-mobile.html',
    styleUrl: './tab-header-mobile.scss',
})
export class TabHeaderMobile implements OnInit {
    @Input() progressPercentage: number = 0;
    @Input() modules: any[] = [];
    @Input() categories: any[] = [];

    @Output() filterChanges = new EventEmitter<any>();
    @Output() updateUserData = new EventEmitter<boolean>();

    unreadCount: number = 0;
    profile_picture: any = undefined;
    selectedIndex: number = 0;
    pageName: any[] = [
        'Página inicial'
        , 'Vídeos'
        , 'Materiais'
        , 'Download'
        , 'Progressão'
    ];
    routes: any[] = [
        'recomendacoes'
        , 'videos'
        , 'materiais'
        , 'engine'
        , 'progression'
    ];

    // filtros
    showFilters: boolean = false;
    searchQuery: string = '';
    selectedModule: string | null = null;
    selectedCategory: string | null = null;
    pagesConfig: any[] = [
        {page: 'recomendacoes', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'videos', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'materiais', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'engine', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'progression', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
    ];

    private userId: number | null = null;

    constructor(private router: Router
              , private userService: UserService
              , private userNotificationService: UserNotificationService
              , private dialogService: DialogService
    ) {
        addIcons({
            homeOutline
            , playCircleOutline
            , documentTextOutline
            , hardwareChipOutline
            , downloadOutline
            , filterOutline
            , searchOutline
            , cogOutline
            , logOutOutline
            , personOutline
            , notificationsOutline
        });

        this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
            const url = this.router.url.replace('/','');
            this.selectedIndex = this.routes.indexOf(url);
        });
    }

    ngOnInit() {
        const url = this.router.url.replace('/','');
        this.selectedIndex = this.routes.indexOf(url);

        this.userService.getProfile().subscribe({
            next: (res) => {
                if (res.user.profile_picture !== null)
                    this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;

                this.userId = res.user.id;
                this.loadUnreadCount();
            },
            error: (err) => {
                console.error("Failet to find profile:", err);

                if (err.status === 401)
                    this.router.navigate(['/login']);
            }
        });
    }

    go(index:number) {
        this.resetFilterComponent(index);

        this.selectedIndex = index;
        this.router.navigate([
            '/', this.routes[index]
        ]);

        this.updateUserData.emit(true);
    }

    resetFilterComponent(index: any) {
        this.showFilters = this.pagesConfig[index].showFilters;
        this.searchQuery = this.pagesConfig[index].searchQuery,
        this.selectedModule = this.pagesConfig[index].selectedModule;
        this.selectedCategory = this.pagesConfig[index].selectedCategory;
    }

    filterConfigUpdate() {
        this.pagesConfig[this.selectedIndex].showFilters = this.showFilters;
        this.pagesConfig[this.selectedIndex].searchQuery = this.searchQuery,
        this.pagesConfig[this.selectedIndex].selectedModule = this.selectedModule;
        this.pagesConfig[this.selectedIndex].selectedCategory = this.selectedCategory;
    }

    searchUpdate() {
        this.filterConfigUpdate();
        const filters: any = {
            searchQuery: this.searchQuery,
            selectedModule: this.selectedModule,
            selectedCategory: this.selectedCategory,
            pageIndex: this.selectedIndex,
        };
        this.filterChanges.emit(filters);
    }

    showFilterUpdate() {
        this.showFilters = !this.showFilters;
        this.filterConfigUpdate()
    }

    Configuracoes() {
        this.router.navigate(['/userConfigs']);
    }
    
    Logout() {
        this.userService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error("Logout error:", err);
            }
        });
    }

  openNotifications(): void {
    this.dialogService.openNotificationsDialog().subscribe((result) => {
      this.loadUnreadCount();

      if (result.data?.selected?.page_link)
        this.router.navigateByUrl(result.data.selected.page_link);
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
}