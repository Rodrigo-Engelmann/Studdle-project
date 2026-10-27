// angular
import { Component, HostListener, OnInit, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

// components
import { ProgressionDesktopComponent } from '../progression-desktop/progression-desktop.component'
import { ProgressionMobileComponent } from '../progression-mobile/progression-mobile.component'

// models
import { TreeNode } from '../dialogs/rank-tree-dialog/models/tree-node.model';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'
import { TaskContentKey } from '../enums/task-content.enums';
import { QuizOutcome } from '../enums/quiz-player.enums';

// services
import { RankTreeDialogService } from '../dialogs/rank-tree-dialog/rank-tree-dialog.service';
import { ModuleService } from '../../services/modules/modules.service';
import { DialogService } from '../services/dialog.service'
import { TaskService } from '../../services/tasks/tasks.service';
import { QuizService } from '../../services/quizzes/quizzes.service';
import { VideoService } from '../../services/videos/videos.service';
import { MaterialService } from '../../services/materials/materials.service';
import { UserService } from '../../services/users/users.service';
import { ImageColorService } from '../services/image-color/imageColor.service';
import { TaskContentStatusService } from '../../services/taskcontent-status/taskcontent-status.service';
import { ProgressionDataBridgeService } from '../services/progressionData-bridge.service';

// rxjs
import { firstValueFrom } from 'rxjs';

interface QuizOptionForm {
  id?: number;
  text: string;
  right_answer: boolean;
}

interface QuizForm {
  name: string;
  image: string;
  options: QuizOptionForm[];
}

@Component({
  selector: 'app-progression',
  templateUrl: './progression.component.html',
  imports: [
    ProgressionDesktopComponent
    , ProgressionMobileComponent
    , MatIconModule
  ],
  styleUrls: ['./progression.component.scss']
})
export class Progression implements OnInit {
  @Input() moduleData: any = { image: undefined, name: '' };
  @Input() studyTasksData = { studyCompleted: 0, totalStudyContents: 0 };
  @Input() practiceTaskData = { practiceCompleted: 0, totalPracticeContents: 0 };
  @Input() mainProgress: number = 0;
  @Input() profile_picture: any = undefined;

  userModuleId: number = -1;
  userId: number = -1;
  isMobile: boolean = window.innerWidth <= 1082;
  modules: TreeNode[] = [];
  tasks: TreeNode[] = [];
  quizzes: TreeNode[] = [];
  rankQuiz: any[] = [];

  privilege: number = 0;

  constructor(private rankTreeDialogService: RankTreeDialogService
            , private moduleService: ModuleService
            , private taskService: TaskService
            , private dialogService: DialogService
            , private quizService: QuizService
            , private videoService: VideoService
            , private materialService: MaterialService
            , private userService: UserService
            , private imageColorService: ImageColorService
            , private taskContentStatusService: TaskContentStatusService
            , private progressionDataBridgeService: ProgressionDataBridgeService
            , private router: Router
  ) {}

  ngOnInit(): void {
    this.updatePage();
  }

  async updatePage(): Promise<void> {
    this.mainProgress = 0;
    const userData: any = await this.getUserData();

    this.userModuleId = userData.current_module_id
    this.userId = userData.id;
    this.moduleUpdate(userData.current_module_id);
    this.userTasksUpdate(userData.id, userData.current_module_id);
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
    let progressPercentage: number = 0;
    if (totalTasksCnt) {
      const userTasksCnt: number = studyCompleted + practiceCompleted;
      progressPercentage = (userTasksCnt / totalTasksCnt) * 100;
      this.mainProgress = progressPercentage;
    }
    this.progressionDataBridgeService.updateTabProgressData(progressPercentage);
    this.userService.updateModuleProgress(userId, progressPercentage);
  }
  //#endregion

  async getUserData(): Promise<any> {
    try {
      const userData: any = await firstValueFrom(this.userService.getProfile());
      if (userData.user.profile_picture !== null)
        this.profile_picture = `http://localhost:3000${userData.user.profile_picture}`;

      this.privilege = userData.user.privileges;
      return userData.user;
    } catch(err: any) {
      console.error("--error: ERRO AO ENCONTRAR CONTA: ", err);

      if (err.status === 401)
        this.router.navigate(['/login']);
    }
  }
  
  moduleUpdate(module_id: number): void {    
    this.moduleService.findById(module_id).subscribe({
      next: async (res: any) => {
        this.moduleData = {
          image: `http://localhost:3000${res.image}`,
          name: res.name,
          color: await this.imageColorService.getAverageColor(`http://localhost:3000${res.image}`),
          id: res.id
        }
      },
      error: (err) => {
        console.error("--error: ", err)
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 1082;
  }

  async loadManagerData() {
    try {
      // -rank
      const modules: any = await firstValueFrom( this.moduleService.findAll() );
      modules.map((r: any) => r.type = 'rank');

      // -tasks
      const tasks: any = await firstValueFrom( this.taskService.findAll() );
      tasks.map((r: any) => r.type = 'task');

      // -quizzes
      const quizzes: any = await firstValueFrom( this.quizService.findAll() );
      quizzes.map((r: any) => r.type = 'quiz');

      // children inheritance
      tasks.map((t: any) => t.children = quizzes.filter((q: any) => q.task_id === t.id));
      modules.map((m: any) => m.children = tasks.filter((t: any) => t.module_id === m.id));

      // validation tag
      quizzes.map((q: any) => q.valid = true);
      modules.map((m: any) => m.valid = true);
      tasks.map((t: any) => t.valid = true);

      // global values update
      this.quizzes = quizzes;
      this.modules = modules;
      this.tasks = tasks;

      return modules;
    } catch (err) {
      console.error("--error: ", err);
      return null;
    }
  }

  async updateManager() {
    const data = await this.loadManagerData();
    if (!data)
      return;

    this.rankTreeDialogService.updateData(data);
  }

  async openTaskManager() {
    if (this.privilege === 0)
      return;

    const data = await this.loadManagerData();
    if (!data)
      return;

    this.rankTreeDialogService.open(data).subscribe(action => {
      switch (action.action) {
        case 'edit':
          if (!action.node)
            return;

          switch(action.node.type) {
            case 'quiz':
              this.editQuiz(action.node!.id);
              break;
            case 'task':
              this.editTask(action.node.module.id, action.node!.id);
              break;
            case 'rank':
              this.editModule(action.node!.id);
              break;
          }
          break;
        case 'delete':
          if (!action.node)
            return;
          
          const selectedId: number = action.node!.id;

          switch (action.node.type) {
            case 'quiz':
              this.deleteQuiz(selectedId);
              break;
            case 'task':
              this.deleteTask(selectedId);
              break;
            case 'rank':
              this.deleteModule(selectedId);
              break;
          }
          break;
        case 'add':
          switch (action.parent?.type) {
            case 'task':
              this.createQuiz(action.parent.module.id, action.parent.id);
              break;
            case 'rank':
              this.createTask(action.parent.id);
              break;
          }

          if (action.parent === null)
            this.createModule();
          break;
        case 'content':
          if (!action.node)
            return;

          this.openTaskContentDialog(action.node.id);
          break;
      }
    });
  }

  //#region TASK CONTENT
  async openTaskContentDialog(taskId: number): Promise<void> {
    if (this.privilege === 0)
      return;

    try {
      const [videos, materials, task]: any = await Promise.all([
        firstValueFrom(this.videoService.findAll()),
        firstValueFrom(this.materialService.findAll()),
        firstValueFrom(this.taskService.findById(taskId)),
      ]);

      const contents: any[] = task.task_contents ?? [];
      const result = await firstValueFrom(
        this.dialogService.openSelection({
          title: `Conteúdos de "${task.name}"`,
          subtitle: 'Marque os vídeos e materiais que concluem essa tarefa',
          size: DialogSize.LARGE,
          tabs: [
            {
              key: TaskContentKey.VIDEOS,
              label: 'Vídeos',
              emptyMessage: 'Nenhum vídeo cadastrado ainda.',
              // cada linha tem video_id OU material_id preenchido
              selected: contents.filter((c) => c.video_id).map((c) => c.video_id),
              items: videos.map((v: any) => ({
                id: v.id,
                title: v.title,
                thumbnail: v.thumbnail
              }))
            },
            {
              key: TaskContentKey.MATERIALS,
              label: 'Materiais didáticos',
              emptyMessage: 'Nenhum material cadastrado ainda.',
              selected: contents.filter((c) => c.material_id).map((c) => c.material_id),
              items: materials.map((m: any) => ({
                id: m.id,
                title: m.title,
                thumbnail: 'http://localhost:3000' + m.main_image
              }))
            }
          ]
        })
      );
      if (!result.confirmed)
        return;

      this.taskService.updateContent(taskId, {
        video_ids: result.data![TaskContentKey.VIDEOS] as number[],
        material_ids: result.data![TaskContentKey.MATERIALS] as number[]
      }).subscribe({
        next: () => this.updateManager(),
        error: (err: any) => console.error('--Error: ', err)
      });
    } catch (err) {
      console.error('--Error ao abrir conteúdos da tarefa: ', err);
    }
  }
  
  //#endregion

  //#region QUIZ
  async openQuizFormDialog(model: Partial<QuizForm> = {}): Promise<QuizForm | undefined> {
    if (this.privilege === 0)
      return;

    const form = await firstValueFrom(
      this.dialogService.openForm<any>({
        title: model.options?.length ? 'Editar quiz' : 'Criar quiz',
        subtitle: 'Marque a alternativa correta.',
        size: DialogSize.LARGE,
        ...( Object.keys(model).length && { model } ),
        fields: [
          { key: 'image', label: 'Imagem', type: FieldType.FILE, required: true, width: FieldWidth.HALF },
          { key: 'name', label: 'Nome', type: FieldType.TEXT, required: true, maxLength: 100, width: FieldWidth.FULL },
          { key: 'options', label: 'Alternativas', type: FieldType.GROUP_LIST, itemLabel: 'Alternativa',
            addItemLabel: 'Adicionar alternativa', minItems: 2, maxItems: 5, singleSelectionKey: 'right_answer',
            subFields: [
              {
                key: 'text',
                label: 'Texto',
                type: FieldType.TEXT,
                required: true,
                maxLength: 255,
                width: FieldWidth.FULL,
              },
              {
                key: 'right_answer',
                label: 'Resposta correta',
                type: FieldType.CHECKBOX,
                width: FieldWidth.FULL,
              },
            ],
          },
        ],
      }),
    );
  
    return form.confirmed ? form.data : undefined;
  }
  
  async uploadQuizImage(data: any): Promise<string> {
    if (!(data.image instanceof File))
      return '';

    const imageData: any = await firstValueFrom(
      this.quizService.uploadImage(data.image)
    );

    return imageData.path;
  }

  async createQuiz(moduleId: number, taskId: number): Promise<void> {
    const formData = await this.openQuizFormDialog();
    if (!formData) return;

    formData.image = await this.uploadQuizImage(formData);

    this.quizService.create({ ...formData, module_id: moduleId, task_id: taskId }).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error('--Error: ', error),
    });
  }
  
  async editQuiz(quizId: number): Promise<void> {
    const quiz: any = await firstValueFrom(this.quizService.findById(quizId));
    const formData: any = await this.openQuizFormDialog({
      image: quiz.image,
      name: quiz.name,
      options: (quiz.options ?? []).map((o: any) => ({
        id: o.id,
        text: o.text,
        right_answer: o.right_answer,
      })),
    });
    if (!formData)
      return;

    this.quizService.update(quizId, formData).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error('--Error: ', error),
    });
  }

  deleteQuiz(quizId: number) {
    this.quizService.delete(quizId).subscribe({
      next: () => this.updateManager(),
      error: (err) => console.error("--Error: ", err)
    });
  }
  //#endregion

  //#region TASK
  async openTaskFormDialog(moduleId: number, model: object = {}): Promise<any> {
    const form: any = await firstValueFrom(
      this.dialogService.openForm<any>({
        title: 'Criar Tarefa',
        ...(Object.keys(model).length && { model }),
        size: DialogSize.SMALL,
        fields: [
          {
            key: 'name',
            label: 'Nome',
            type: FieldType.TEXT,
            required: true,
            maxLength: 255
          }
        ]
      })
    );
    if (!form.confirmed)
      return;

    const formData: any = form.data;
    formData.module_id = moduleId;
    return formData;
  }

  async createTask(moduleId: number) {
    const formData: any = await this.openTaskFormDialog(moduleId);
    if (!formData)
      return;

    this.taskService.create(formData).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error("--Error: ", error)
    })
  }

  async editTask(moduleId: number, taskId: number) {
    const selectedData: TreeNode | undefined = this.tasks.find((m: any) => m.id === taskId);
    if (!selectedData || !selectedData.valid)
      return;

    const formData: any = await this.openTaskFormDialog(moduleId, {name: selectedData.name});
    if (!formData)
      return;

    this.taskService.update(taskId, formData).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error("--Error: ", error)
    });
  }

  deleteTask(taskId: number) {
    this.taskService.delete(taskId).subscribe({
      next: () => this.updateManager(),
      error: (err) => console.error("--Error: ", err)
    });
  }
  //#endregion

  //#region MODULE
  async openModuleFormDialog(model: object = {}): Promise<any> {
    const form: any = await firstValueFrom(
      this.dialogService.openForm<any>({
        title: 'Criar Módulo',
        ...(Object.keys(model).length && { model }),
        size: DialogSize.SMALL,
        fields: [
          { key: 'name', label: 'Nome', type: FieldType.TEXT, required: true, maxLength: 100 },
          { key: 'image', label: 'Imagem do rank', type: FieldType.FILE, required: true, maxLength: 255 },
          { key: 'module', label: 'Sequência', type: FieldType.NUMBER, required: true },
          { key: 'release_status', label: 'Status', type: FieldType.SELECT, required: true,
            options: [
              {
                value: 'beta',
                label: 'Beta'
              },
              {
                value: 'released',
                label: 'Lançado'
              }
            ]
          }
        ]
      })
    );
    if (!form.confirmed)
      return;

    return form.data;
  }

  async createModule(): Promise<void> {
    const formData: any = await this.openModuleFormDialog();
    if (!formData)
      return;

    this.moduleService.uploadImage(formData.image)
    .subscribe((uploadRes) => {
      formData.image = uploadRes.path;

      this.moduleService.create(formData).subscribe({
        next: () => this.updateManager(),
        error: (error) => console.error('--Error:', error)
      });
    });
  }

  async editModule(selectedId: number): Promise<void> {
    const selectedData: TreeNode | undefined = this.modules.find((m: any) => m.id === selectedId);
    if (!selectedData || !selectedData.valid)
      return;

    const model: object = {
      name: selectedData.name
      , module: selectedData.module
      , release_status: selectedData.release_status
      , image: selectedData.image
    };
    const formData = await this.openModuleFormDialog(model);
    if (!formData)
      return;

    if (formData.image !== selectedData.image) {
      const uploadRes = await firstValueFrom(
        this.moduleService.uploadImage(formData.image)
      );

      formData.image = uploadRes.path;
    }

    try {
      await firstValueFrom(this.moduleService.update(selectedId, formData));
      this.updateManager();
    } catch (error) {
      console.error('--Error:', error);
    }
  }

  deleteModule(moduleId: number): void {
    this.moduleService.delete(moduleId).subscribe({
      next: () => this.updateManager(),
      error: (err) => console.error("--Rrror: ", err)
    });
  }
  //#endregion

  //#region QUIZ DIALOG
  async openQuizDialog(): Promise<void> {
    if (this.userModuleId === -1)
      return;

    const selectedQuizzes: any = await firstValueFrom(this.quizService.findRandomByModule(this.userModuleId));

    this.rankQuiz = selectedQuizzes;
    const result = await firstValueFrom(
      this.dialogService.openQuizPlayer({
        title: 'Quiz para subir de rank!',
        questions: selectedQuizzes,
      }),
    );

    if (result.data?.outcome === QuizOutcome.PASSED)
      this.liberateNextRank();
  }

  async liberateNextRank(): Promise<void> {
    try {
      const allModules: any[] = await firstValueFrom(this.moduleService.findAll());
      const allModulesSequence: any[] = allModules.sort((a, b) => a.module - b.module);
      const currentModuleIndex: number = allModules.findIndex((mod) => mod.id === this.userModuleId);
      const nextModule: any = allModulesSequence[currentModuleIndex+1];
      const nextModuleId: number = nextModule.id;

      await firstValueFrom(this.userService.updateModule(this.userId, nextModuleId));
      this.updatePage();
      
    } catch(err) {
      console.error("--error: ", err)
    }
  }
  //#endregion
}
