import { Component } from '@angular/core';

@Component({
  selector: 'app-engine',
  imports: [],
  templateUrl: './engine.html',
  styleUrl: './engine.scss',
})
export class Engine {
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
