// Angular
import { Component } from '@angular/core';
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

// Common
import { material } from '../../../../common/material';

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
export class ViewMaterial {
  search_header: HTMLElement | null = null;
  profile_picture: any;
  materialData!: material;

  constructor( private router: Router
             , private userService: UserService
             , private route: ActivatedRoute
             , private materialService: MaterialService
             , private taskContentService: TaskContentService
             , private taskContentStatusService: TaskContentStatusService
  ) {}

  ngAfterViewInit() {
    this.search_header = document.getElementsByClassName("search-header")[0] as HTMLElement;
    // if (this.search_header)
    //   this.search_header.style.zIndex = '1012312';

    const header = document.querySelector('app-tab-header') as HTMLElement;
    if (header) {
      header.style.width = '100%';
      header.style.display = 'block';
    }

    const page_container = document.getElementsByClassName('.page-container')[0] as HTMLElement;
    if (page_container)
      page_container.style.height = '100%';

  }

  async ngOnInit(): Promise<void> {
    let userData: any = undefined;
    this.userService.getProfile().subscribe({
      next: (res) => {
        userData = res.user;
        if (res.user.profile_picture !== null)
          this.profile_picture = `http://localhost:3000${res.user.profile_picture}`;
      },
      error: (err) => {
        console.error("Failed to find profile:", err);

        if (err.status === 401)
          this.router.navigate(['/login']);
      }
    });

    this.route.paramMap.subscribe(params => {
      const materialUrl: string | null = params.get('materialUrl');
      
      if (materialUrl !== null)
        this.materialService.findByURL(materialUrl).subscribe(async(res: any)=>{
          const taskContent: any = await this.getTaskContent(res.id);
          const taskContentId: number = taskContent[0].id;
          const userId: number = userData.id;
          
          if (userData) {
            this.taskContentStatusService.findOne(userId, taskContentId).subscribe({
              next: async (taskStatus) => {
                if (!taskStatus) {
                  const data: object = {
                    task_content_id: taskContentId
                    , user_id: userId
                    , completed: true
                  };
                  await this.taskContentStatusService.create(data);
                  return
                }
              },
              error: (err) => {
                console.error("--error: ", err);
              }
            });
          }

          this.materialData = res;
        })
    });
  }

  getTaskContent(videoId: number): any {
    const taskContent: any = firstValueFrom(this.taskContentService.findByVideo(videoId));
    return taskContent;
  }

  // sistema de popup da profile-picture:
  Configuracoes() {
    console.log("Usuário clicou em configurações");
    this.router.navigate(['/userConfigs']);
  }

  Logout() {
    console.log("Usuário clicou em Logout");
  }
}