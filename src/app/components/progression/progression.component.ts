import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// components
import { ProgressionDesktopComponent } from '../progression-desktop/progression-desktop.component'
import { ProgressionMobileComponent } from '../progression-mobile/progression-mobile.component'

// models
import { TreeNode } from '../dialogs/rank-tree-dialog/models/tree-node.model';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'
import { TaskContentKey } from '../enums/task-content.enums';

// services
import { RankTreeDialogService } from '../dialogs/rank-tree-dialog/rank-tree-dialog.service';
import { ModuleService } from '../../services/modules/modules.service';
import { DialogService } from '../services/dialog.service'
import { TaskService } from '../../services/tasks/tasks.service';
import { QuizService } from '../../services/quizzes/quizzes.service';
import { VideoService } from '../../services/videos/videos.service';
import { MaterialService } from '../../services/materials/materials.service';


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
  isMobile: boolean = window.innerWidth <= 1082;
  modules: TreeNode[] = [];
  tasks: TreeNode[] = [];
  quizzes: TreeNode[] = [];

  constructor(private rankTreeDialogService: RankTreeDialogService
            , private moduleService: ModuleService
            , private taskService: TaskService
            , private dialogService: DialogService
            , private quizService: QuizService
            , private videoService: VideoService
            , private materialService: MaterialService
  ) {}

  ngOnInit() {
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
      console.log("--error: ", err);
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
    const data = await this.loadManagerData();
    if (!data)
      return;

    this.rankTreeDialogService.open(data).subscribe(action => {
      console.log("action: ", action)
      switch (action.action) {
        case 'edit':
          if (!action.node)
            return;

          if (action.node.type === 'quiz')
            this.editQuiz(action.node!.id, action.node.task.id, action.node.module.id);

          if (action.node.type === 'task')
            this.editTask(action.node.module.id, action.node!.id);

          if (action.node.type === 'rank')
            this.editModule(action.node!.id);
          break;
        case 'delete':
          if (!action.node)
            return;
          
          const selectedId: number = action.node!.id;

          if (action.node.type === 'quiz')
            this.deleteQuiz(selectedId);

          if (action.node.type === 'task')
            this.deleteTask(selectedId);
          
          if (action.node.type === 'rank')
            this.deleteModule(selectedId);
          break;
        case 'add':
          if (action.parent?.type === 'task')
            this.createQuiz(action.parent.module.id, action.parent.id);

          if (action.parent?.type === 'rank')
            this.createTask(action.parent.id);

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
    const form = await firstValueFrom(
      this.dialogService.openForm<any>({
        title: model.options?.length ? 'Editar quiz' : 'Criar quiz',
        subtitle: 'Marque a alternativa correta.',
        size: DialogSize.LARGE,
        ...(Object.keys(model).length && { model }),
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
  
  async createQuiz(moduleId: number, taskId: number): Promise<void> {
    const formData = await this.openQuizFormDialog();
    if (!formData) return;

    this.quizService.create({ ...formData, module_id: moduleId, task_id: taskId }).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error('--Error: ', error),
    });
  }
  
  async editQuiz(quizId: number, taskId: number, moduleId: number): Promise<void> {
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
    console.log("formData: ", formData);
    if (!formData)
      return;

  // module_id: number;
  // task_id: number;
  
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

    this.moduleService.create(formData).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error('--Error:', error)
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
    };
    const formData = await this.openModuleFormDialog(model);
    if (!formData)
      return;

    this.moduleService.update(selectedId, formData).subscribe({
      next: () => this.updateManager(),
      error: (error) => console.error('--Error:', error)
    });
    this.updateManager();
  }

  deleteModule(moduleId: number): void {
    this.moduleService.delete(moduleId).subscribe({
      next: (res) => this.updateManager(),
      error: (err) => console.error("--Rrror: ", err)
    });
  }
  //#endregion
}
