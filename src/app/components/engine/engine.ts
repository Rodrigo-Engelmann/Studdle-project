import { Component, OnInit } from '@angular/core';

// services
import { UserDataBridgeService } from '../services/userData-bridge.service';

// others
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-engine',
  imports: [],
  templateUrl: './engine.html',
  styleUrls: ['./engine.scss'],
})
export class Engine implements OnInit {
  userData: any = undefined;

  constructor(private userDataBridgeService: UserDataBridgeService) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userDataBridgeService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bridgeUserData: any) => {
        this.userData = bridgeUserData;
    });
  }

  ngAfterViewInit(): void {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
      button.style.transition = '0.08s ease';

      button.addEventListener('mouseenter', () => {
        (button as HTMLElement).style.boxShadow = '0 0 10px var(--color-purple2)';
        (button as HTMLElement).style.transform = 'translateY(-5px)';
        (button as HTMLElement).style.cursor = 'pointer';
      });

      button.addEventListener('mouseleave', () => {
        (button as HTMLElement).style.boxShadow = 'none';
        (button as HTMLElement).style.transform = 'translateY(0px)'
      });
    });
  }
}
