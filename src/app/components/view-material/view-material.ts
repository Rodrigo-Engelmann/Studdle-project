// Angular
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

// Services
import { UserService } from '../../services/users/users.service';
import { MaterialService } from '../../services/materials/materials.service';
import { TaskContentService } from '../../services/task_contents/task_contents.service';
import { TaskContentStatusService } from '../../services/taskcontent-status/taskcontent-status.service'
import { DialogService } from '../services/dialog.service'

// Common
import { material } from '../../../../common/material';
import { DialogSize, FieldType, FieldWidth } from '../enums/dialog.enums'

// Others
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view-material',
  imports: [
    MatIconModule
    , MatMenuModule
    , MatButtonModule
  ],
  templateUrl: './view-material.html',
  styleUrl: './view-material.scss',
})
export class ViewMaterial implements OnInit {
  search_header: HTMLElement | null = null;
  profile_picture: any;
  materialData: material = new material;
  userData: any = undefined;
  privilege: number = 0;

  constructor( private router: Router
             , private userService: UserService
             , private route: ActivatedRoute
             , private materialService: MaterialService
             , private taskContentService: TaskContentService
             , private taskContentStatusService: TaskContentStatusService
             , private dialogService: DialogService
  ) {}

  ngAfterViewInit() {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;

    const header: any = document.querySelector('app-tab-header') as HTMLElement;
    if (header) {
      header.style.width = '100%';
      header.style.display = 'block';
    }

    const page_container: any = document.getElementsByClassName('.page-container')[0] as HTMLElement;
    if (page_container)
      page_container.style.height = '100%';

  }

  async ngOnInit(): Promise<void> {
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.userData = res.user;
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;

        this.privilege = res.user.privileges;
        this.userService.updateColorScheme(res.user.color_scheme??1);
      },
      error: (err) => {
        console.error("Failed to find profile:", err);

        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });

    this.updateMaterialData();
  }

  updateMaterialData(): void {
    this.route.paramMap.subscribe(params => {
      const materialUrl: string | null = params.get('materialUrl');
      if (materialUrl !== null)
        this.materialService.findByURL(materialUrl).subscribe(async(res: any) => {
          const materialId: number = res.id;
          const taskContent: any = await firstValueFrom(this.taskContentService.findByMaterial(materialId));
          if (taskContent.length) {
            const taskContentId: number = taskContent[0].id;
            const userId: number = this.userData.id;
            
            if (this.userData) {
              this.taskContentStatusService.findOne(userId, taskContentId).subscribe({
                next: async(taskStatus) => {
                  if (!taskStatus) {
                    const data: object = {
                      task_content_id: taskContentId
                      , user_id: userId
                      , completed: true
                    };
                    await this.taskContentStatusService.create(data);
                    return;
                  }
                },
                error: (err) => {
                  console.error("--error: ", err);
                }
              });
            }
          }
          this.materialData = res;
        });
    });
  }

  // sistema de popup da profile-picture:
  Configuracoes() {
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }

  openComments(): void {
    this.dialogService.openCommentsDialog(this.materialData.id).subscribe();
  }
  
  goBack() {
    this.router.navigate(['/materiais']);
  }

  settingsSelect() {
    this.dialogService.openForm<any>({
      title: 'Atualizar Material Didático',
      size: DialogSize.LARGE,
      model: {
        main_image: this.materialData.main_image,
        title: this.materialData.title,
        summary: this.materialData.summary,
        main_content: this.materialData.main_content,
        sequence: this.materialData.sequence
      },
      fields: [
        { key: 'main_image', label: 'Imagem principal', type: FieldType.FILE, required: true, width: FieldWidth.HALF },
        { key: 'title', label: 'Título', type: FieldType.TEXT, required: true, maxLength: 100  },
        { key: 'summary', label: 'Resumo', type: FieldType.TEXT, required: true, maxLength: 250  },
        { key: 'main_content', label: 'Conteúdo', type: FieldType.RICH_TEXT, required: true },
        { key: 'sequence', label: 'Sequência dos materiais', type: FieldType.NUMBER, required: true }
      ],
    }).subscribe((res: any) => {
      if (!res.confirmed)
        return;

      const data = res.data;
      if (data.main_image instanceof File) {
        this.materialService.uploadImage(data.main_image)
          .subscribe((uploadRes) => {
            data.main_image = uploadRes.path;

            this.updateMaterial(data);
          });
      } else {
        data.main_image = this.materialData.main_image;

        this.updateMaterial(data);
      }
    });
  }

  updateMaterial(data: any): void {
    this.materialService.update(this.materialData.id, data)
    .subscribe((_updateRes: any) => {
      this.updateMaterialData();
    });
  }
}