// angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

// ionic framework
import { addIcons } from 'ionicons';
import { IonHeader, IonToolbar, IonContent, IonFooter, IonTabButton, IonIcon, IonInput, IonSelectOption, IonSelect, IonButton } from '@ionic/angular/standalone';
import { homeOutline, playCircleOutline, documentTextOutline, hardwareChipOutline, downloadOutline, filterOutline, searchOutline, cogOutline, logOutOutline } from 'ionicons/icons';

// outro
import { filter } from 'rxjs';
import { UserService } from '../../services/users/users.service';

@Component({
    selector: 'app-tab-header-mobile',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatIconModule,

        IonHeader,
        IonToolbar,
        IonContent,
        IonFooter,
        IonTabButton,
        IonIcon,
        IonInput,
        FormsModule,
        IonSelectOption,
        IonSelect,
        IonButton,

        MatMenuModule,
        MatButtonModule
    ],
    templateUrl: './tab-header-mobile.html',
    styleUrl: './tab-header-mobile.scss',
})
export class TabHeaderMobile implements OnInit {
    profile_picture: any = undefined;
    selectedIndex: number = 0;
    pageName: any[] = [
        'Home'
        , 'Videos'
        , 'Materials'
        , 'Download'
    ];
    routes: any[] = [
        'recomendacoes'
        , 'videos'
        , 'materiais'
        , 'engine'
    ];

    // filtros
    showFilters: boolean = false;
    searchQuery: string = '';
    modules: string[] = [
        'nenhum'
        , 'Módulo 1'
        , 'Módulo 2'
        , 'Módulo 3'
    ];
    categories: string[] = [
        'nenhum'
        , 'UI/UX'
        , 'Backend'
        , 'Frontend'
    ];
    selectedModule: string | null = null;
    selectedCategory: string | null = null;
    pagesConfig: any[] = [
        {page: 'recomendacoes', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'videos', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'materiais', hasFilterOptions: true, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
        , {page: 'engine', hasFilterOptions: false, showFilters: false, searchQuery: '', selectedModule: null, selectedCategory: null}
    ];

    constructor(
        private router: Router,
        private userService: UserService
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
        },
        error: (err) => {
            console.error("Erro ao buscar perfil:", err);

            if (err.status === 401) {
            this.router.navigate(['/login']);
            }
        }
        });
    }

    go(index:number) {
        this.resetFilterComponent(index);

        this.selectedIndex = index;
        this.router.navigate([
            '/',
            this.routes[index]
        ]);
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
        this.filterConfigUpdate()
        console.log('-- filtro+search: ', this.searchQuery, this.selectedModule, this.selectedCategory);
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
                console.log("Logout realizado com sucesso!");
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error("Erro ao fazer logout:", err);
            }
        });
    }
}