// angular
import { Component, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// components
import { TabHeader } from '../tab-header/tab-header';
import { TabHeaderMobile } from '../tab-header-mobile/tab-header-mobile';

// services
import { UserService } from '../../services/users/users.service';
import { TaskService } from '../../services/tasks/tasks.service';
import { TaskContentStatusService } from '../../services/taskcontent-status/taskcontent-status.service'

// rxjs
import { firstValueFrom } from 'rxjs';

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

  mobile = window.innerWidth <= 768;

  constructor(private userService: UserService
            , private taskService: TaskService
            , private taskContentStatusService: TaskContentStatusService
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.mobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.userService.getProfile().subscribe((res) => {
      // updates the colorblindess filter option
      this.userService.updateColorBlindFilter(res.user.colorblindness);

      // this.progressPercentage = res.module_progress;
      this.userTasksUpdate(res.user.id, res.user.current_module_id);
    });
  }

  //#region user progression
  async userTasksUpdate(userId: number, moduleId: number): Promise<void> {
    try {
      const tasks = await firstValueFrom(
        this.taskService.findByModule(moduleId)
      );
      this.studyTasksData.totalStudyContents = tasks.length;

      const userTasks = await firstValueFrom(
        this.taskContentStatusService.findByUser(userId)
      );
      console.log("userTasks: ", userTasks)

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
    if (!totalTasksCnt)
      return;
    const userTasksCnt: number = studyCompleted + practiceCompleted;

    const progressPercentage: number = (userTasksCnt / totalTasksCnt) * 100;
    this.progressPercentage = progressPercentage;

    // atualiza a informação de progressão la no usuario, serve pra visualizar a porcentagem depois nos componentes de tab
    this.userService.updateModuleProgress(userId, progressPercentage);
  }
  //#endregion
}