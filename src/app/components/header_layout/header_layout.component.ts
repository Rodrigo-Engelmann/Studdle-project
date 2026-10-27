// angular
import { Component, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// components
import { TabHeader } from '../tab-header/tab-header';
import { TabHeaderMobile } from '../tab-header-mobile/tab-header-mobile';

// services
import { UserService } from '../../services/users/users.service';
import { TaskService } from '../../services/tasks/tasks.service';
import { TaskContentStatusService } from '../../services/taskcontent-status/taskcontent-status.service'
import { ProgressionDataBridgeService } from '../services/progressionData-bridge.service';
import { DialogService } from '../services/dialog.service'
import { QuizService } from '../../services/quizzes/quizzes.service';
import { ModuleService } from '../../services/modules/modules.service';
import { FilterDataService } from '../services/filterData.service';
import { UserDataBridgeService } from '../services/userData-bridge.service'

// common:
import { DialogSize, DialogVariant } from '../enums/dialog.enums';
import { MessageDialogConfig } from '../models/dialog.models';

// rxjs
import { firstValueFrom, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    TabHeader,
    TabHeaderMobile
  ],
  styleUrl: './header_layout.component.scss',
  templateUrl: './header_layout.component.html'
})
export class TabHeaderLayoutComponent implements OnInit {
  @Input() progressPercentage: number = 0;
  @Input() studyTasksData = { studyCompleted: 0, totalStudyContents: 0 };
  @Input() practiceTaskData = { practiceCompleted: 0, totalPracticeContents: 0 };
  @Input() modules: any[] = [ { name:'Nenhum', id: -1 } ];
  @Input() categories: any[] = [ { name:'Nenhum', id: -1 } ];
  @Input() filterChanges: any = undefined;

  mobile = window.innerWidth <= 768;
  pageFilters = [
    { pageIndex: 1 },
    { pageIndex: 2 },
  ];

  private destroy$ = new Subject<void>();

  constructor(private userService: UserService
            , private taskService: TaskService
            , private taskContentStatusService: TaskContentStatusService
            , private progressionDataBridgeService: ProgressionDataBridgeService
            , private filterDataService: FilterDataService
            , private dialogService: DialogService
            , private quizService: QuizService
            , private moduleService: ModuleService
            , private userDataBridgeService: UserDataBridgeService
            , private router: Router
  ) {}

  @HostListener('window:resize')
  onResize() {
    if ((this.mobile && !(window.innerWidth <= 768)) || (!this.mobile && (window.innerWidth <= 768)))
      this.resetPagesFilters();

    this.mobile = window.innerWidth <= 768;
  }

  resetPagesFilters() {
    this.modules = [ { name:'Nenhum', id: -1 } ];
    this.categories = [ { name:'Nenhum', id: -1 } ];
  
    this.pageFilters = [
      { pageIndex: 1 },
      { pageIndex: 2 },
    ];

    this.updateModuleFilter();
    this.filterDataService.updateFilter([
      {
        pageIndex: 1,
        searchQuery: '',
        selectedCategory: null,
        selectedModule: null,
      },
      {
        pageIndex: 2,
        searchQuery: '',
        selectedCategory: null,
        selectedModule: null,
      }
    ]
    );
  } 

  ngOnInit() {
    this.updateModuleFilter();
    this.updateUserData();

    this.progressionDataBridgeService.progressionData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.updateProgressionData(progress);
    });
  }

  async updateModuleFilter(): Promise<void> {
    const moduleList: any[] = await firstValueFrom(this.moduleService.findAll());
    const orderedModules: any[] = moduleList.sort(
          (n1: any, n2: any) =>n1.module - n2.module);
    
    const formatedModuleData: any[] = orderedModules.map((data) => ({ name: data.name, id: data.id }));
    formatedModuleData.map((m) => this.modules.push(m));
  }

  updateProgressionData(progress: number): void {
    this.progressPercentage = progress;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onFilterChanges(event: any): Promise<void> {
    const filtersIndex: number = this.pageFilters.findIndex((page) => page.pageIndex === event.pageIndex);
    this.pageFilters.splice(filtersIndex,1);
    this.pageFilters.push(event);
    
    const selectedModule: any = event.selectedModule;
    this.categories = [ { name:'Nenhum', id: -1 } ];
    if (selectedModule?.name && selectedModule?.name !== null) {
      const moduleTasks: any = await firstValueFrom(this.taskService.findByModule(selectedModule.id));
      moduleTasks.map((task: any) => this.categories.push(task));
    }
    this.filterDataService.updateFilter(this.pageFilters);
  }

  updateUserData(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
      // updates the colorblindess filter option
      this.userService.updateColorBlindFilter(res.user.colorblindness);
      const isNewUser: boolean = res.user.current_module_id
      if (!isNewUser)
        this.detectNewUserModule(res.user);

      this.userTasksUpdate(res.user.id, res.user.current_module_id);

      this.userDataBridgeService.updateTabProgressData(res.user);
      },
      error: (err) => {
        console.error("Failed to find profile:", err);

        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });
  }

  async detectNewUserModule(userData: any): Promise<void> {
    const allModules:any[] = await firstValueFrom(this.moduleService.findAll());
    const orderedModules:any[] = allModules.sort((a, b) => a.module - b.module);
    const allModuleIds: any[] = orderedModules.map((m) => m.id);
    
    // mensagem do mascote
    await firstValueFrom(this.dialogService.openMascot({
      steps: [
        {
          image: '../../../assets/mascot/studd_hello.gif',
          pos: { x: 20, y: 70 },
          message: `Bem vindo ao Studdle, ${userData.user_name}!!`,
          name: 'Studd',
        },
        {
          image: '../../../assets/mascot/studd_talking.gif',
          pos: { x: 80, y: 40 },
          message: 'Antes de começar, queremos saber o que você já sabe...',
          name: 'Studd',
        },
        {
          image: '../../../assets/mascot/studd_thinking.gif',
          pos: { x: 50, y: 65 },
          message: 'Pra isso, vamos colocar para você responder um questionário bem simples para nós!! Boa sorte!!',
          name: 'Studd',
        },
      ],
    }));

    const currentModuleId: number = await this.findUserModule(allModuleIds);
    if (currentModuleId === -1)
      return;

    const currentModuleData: any = await firstValueFrom(this.moduleService.findById(currentModuleId));

    await this.userService.updateModule(userData.id, currentModuleId).subscribe({
      next: (_) => {
      },
      error: (err) => {
        console.error('Erro ao atualizar módulo:', err);
      }
    });

    // mensagem do mascote
    await firstValueFrom(this.dialogService.openMascot({
      steps: [
        {
          image: '../../../assets/mascot/studd_talking.gif',
          pos: { x: 20, y: 70 },
          message: 'Perfeito, agora que sabemos o seu nível, vou te mostrar como a plataforma funciona.',
          name: 'Studd',
        },
        {
          image: '../../../assets/mascot/studd_talking_pointing_right.gif',
          pos: { x: 80, y: 40 },
          message: 'Aqui ficam os seus módulos. Cada um libera o próximo.',
          name: 'Studd',
        },
        {
          image: '../../../assets/mascot/studd_urrai.gif',
          pos: { x: 50, y: 65 },
          message: 'Pronto, é só isso!\nBons estudos.',
          name: 'Studd',
        },
      ],
    }));
    const rankMessageConfig: MessageDialogConfig = {
      title: 'ENCONTRAMOS O SEU RANK!!!',
      message: `Seja Muito Bem Vindo Ao '${currentModuleData.name}'!`,
      variant: DialogVariant.SUCCESS,
      confirmLabel: 'Fechar',
      size: DialogSize.MEDIUM,
    }
    this.dialogService.openMessage(rankMessageConfig);
  }

  async findUserModule(allModuleIds: any[]): Promise<number> {
    let i: number = 1;
    let lastId: number = -1;
    for (const id of allModuleIds) {
      const selectedQuizzes: any = await firstValueFrom(this.quizService.findRandomByModule(id))

      const result = await firstValueFrom(
        this.dialogService.openQuizPlayer({
          title: `Quiz para descobrir o seu rank! #${i}`,
          questions: selectedQuizzes,
        }),
      );
      
      if (!result.data?.livesLeft)
          return id;

      if (!result.confirmed)
        return lastId;
      else {
        const moduleQnt: number = allModuleIds.length;
        if (i === moduleQnt)
          return allModuleIds[moduleQnt-1];
      }


      i++;
      lastId = id;
    }

    return -1;
  }

  //#region user progression
  async userTasksUpdate(userId: number, moduleId: number): Promise<void> {
    try {
      const tasks = await firstValueFrom(
        this.taskService.findByModule(moduleId)
      );
      this.studyTasksData.totalStudyContents = tasks.length;

      const userTasks = await firstValueFrom(
        this.taskContentStatusService.findByUser(userId, moduleId)
      );

      this.studyTasksData.studyCompleted = userTasks.length;
      this.userMainProgressCalc(userId);
    } catch (err) {
      console.error('--error:', err);
    }
  }

  userMainProgressCalc(userId: number) {
    const totalStudyContents: number = this.studyTasksData.totalStudyContents;
    const studyCompleted: number = this.studyTasksData.studyCompleted;
    
    const totalPracticeContents: number = this.practiceTaskData.totalPracticeContents;
    const practiceCompleted: number = this.practiceTaskData.practiceCompleted;
    
    const totalTasksCnt: number = totalStudyContents + totalPracticeContents;
    if (!totalTasksCnt) {
      this.userService.updateModuleProgress(userId, 0);
      return;
    }
    const userTasksCnt: number = studyCompleted + practiceCompleted;

    const progressPercentage: number = (userTasksCnt / totalTasksCnt) * 100;
    this.progressPercentage = progressPercentage;

    // atualiza a informação de progressão la no usuario, serve pra visualizar a porcentagem depois nos componentes de tab
    this.userService.updateModuleProgress(userId, progressPercentage);
  }
  //#endregion
}