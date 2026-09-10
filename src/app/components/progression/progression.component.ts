import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// components
import { ProgressionDesktopComponent } from '../progression-desktop/progression-desktop.component'
import { ProgressionMobileComponent } from '../progression-mobile/progression-mobile.component'

// models
import { TreeNode } from '../dialogs/rank-tree-dialog/models/tree-node.model';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// services
import { RankTreeDialogService } from '../dialogs/rank-tree-dialog/rank-tree-dialog.service';
import { ModuleService } from '../../services/modules/modules.service';
import { DialogService } from '../services/dialog.service'

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
  ranks: TreeNode[] = [
    {
      id: 'rank-1',
      type: 'rank',
      name: 'Iniciante',
      children: [
        {
          id: 'task-1',
          type: 'task',
          name: 'Completar 5 exercícios de lógica',
          children: [
            { id: 'quiz-1', type: 'quiz', name: 'Quiz de lógica básica' },
          ],
        },
        {
          id: 'task-2',
          type: 'task',
          name: 'Enviar primeiro projeto',
          children: [],
        },
      ],
    },
    {
      id: 'rank-2',
      type: 'rank',
      name: 'Intermediário',
      children: [
        {
          id: 'task-3',
          type: 'task',
          name: 'Resolver 10 desafios de algoritmos',
          children: [
            { id: 'quiz-2', type: 'quiz', name: 'Quiz de estruturas de dados' },
            { id: 'quiz-3', type: 'quiz', name: 'Quiz de complexidade' },
          ],
        },
      ],
    },
    {
      id: 'rank-3',
      type: 'rank',
      name: 'Avançado',
      children: [],
    },
  ];

  constructor(private rankTreeDialogService: RankTreeDialogService
            , private moduleService: ModuleService
            , private dialogService: DialogService
  ) {}

  ngOnInit() {
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 1082;
  }

  newTask() {
    console.log("NEW TASK");
  }

  newModule() {
    console.log("NEW MODULE");
  }

  openTaskManager() {
    this.rankTreeDialogService.open(this.ranks).subscribe(action => {
      console.log("action: ", action)
      switch (action.action) {
        case 'edit':
          /* abre seu form de edição com action.node */
          break;
        case 'delete':
          /* chama seu backend pra deletar action.node */
          break;
        case 'add':
          /* abre seu form de criação; action.parent é onde entra (null = novo rank) */

          if (action.parent === null)
            this.createModule();
          break;
      }
    });
  }

  //#region MODULE
  createModule() {
    this.dialogService.openForm<any>({
      title: 'Criar Módulo',
      size: DialogSize.SMALL,

      fields: [
        {
          key: 'module', label: 'Número do módulo', type: FieldType.NUMBER, required: true
        },
        { key: 'release_status', label: 'Status do módulo', type: FieldType.SELECT, required: true,
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
      ],
    }).subscribe(async (res: any) => {
      console.log('FORM RES: ', res);

      // Aqui depois você pode chamar o service
      // this.moduleService.create(res).subscribe(...)
    });

    // this.moduleService.create()
  }
  editModule() {
    // this.dialogService.openForm<any>({
    //   title: 'Editar Módulo',
    //   size: DialogSize.SMALL,
    //   model: { module: this.module.module, release_status: this.module.release_status },
    //   fields: [
    //     { key: 'module', label: 'Número do módulo', type: FieldType.NUMBER, required: true },
    //     { key: 'release_status', label: 'Status do módulo', type: FieldType.SELECT, required: true,
    //       options: [
    //         {
    //           value: 'beta',
    //           label: 'Beta'
    //         },
    //         {
    //           value: 'released',
    //           label: 'Lançado'
    //         }
    //       ]
    //     }
    //   ],

    // }).subscribe(async (res: any) => {
    //   console.log('FORM RES: ', res);

    //   // this.moduleService.update(this.module.id, res).subscribe(...)
    // });
  }
  deleteModule() {

  }
  //#endregion
}
