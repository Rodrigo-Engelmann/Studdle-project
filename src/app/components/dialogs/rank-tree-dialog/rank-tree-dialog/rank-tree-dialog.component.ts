import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, Subject, Subscription } from 'rxjs';

import { FlatTreeNode, TreeNode, TreeNodeAction } from '../models/tree-node.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

const NODE_ICON: Record<string, string> = {
  rank: 'military_tech',
  task: 'assignment',
  quiz: 'quiz',
};

const NODE_LABEL: Record<string, string> = {
  rank: 'rank',
  task: 'tarefa',
  quiz: 'quiz',
};

@Component({
  selector: 'app-rank-tree-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './rank-tree-dialog.component.html',
  styleUrl: './rank-tree-dialog.component.scss',
})
export class RankTreeDialogComponent implements OnDestroy {
  private readonly actionSubject = new Subject<TreeNodeAction>();
  // Stream pública de ações — o service repassa isso pra quem chamou a dialog
  readonly action$: Observable<TreeNodeAction> = this.actionSubject.asObservable();

  readonly nodeIcon = NODE_ICON;
  readonly nodeLabel = NODE_LABEL;

  // Fica marcado enquanto o menu de um nó estiver aberto (mantém o botão visível)
  menuOpenNode: FlatTreeNode | null = null;

  private readonly transformer = (node: TreeNode, level: number): FlatTreeNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    type: node.type,
    level,
    original: node,
  });

  readonly treeControl = new FlatTreeControl<FlatTreeNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  private readonly treeFlattener = new MatTreeFlattener<TreeNode, FlatTreeNode>(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  readonly dataSource = new MatTreeFlatDataSource<TreeNode, FlatTreeNode>(
    this.treeControl,
    this.treeFlattener
  );

  private readonly dataSub: Subscription;

  constructor(
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: Observable<TreeNode[]>
  ) {
    this.dataSub = data.subscribe((nodes) => {
      this.dataSource.data = nodes;
    });
  }

  ngOnDestroy(): void {
    this.dataSub.unsubscribe();
    this.actionSubject.complete();
  }

  // Rank e task podem ter filhos (mesmo vazios); quiz é sempre folha
  isContainer = (_: number, node: FlatTreeNode) => node.type !== 'quiz';

  onEdit(node: TreeNode): void {
    this.actionSubject.next({ action: 'edit', node });
  }

  onAdd(parent: TreeNode): void {
    this.actionSubject.next({ action: 'add', node: null, parent });
  }

  onAddRootRank(): void {
    this.actionSubject.next({ action: 'add', node: null, parent: null });
  }

  onDelete(node: TreeNode): void {
    const hasChildren = !!node.children?.length;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: `Excluir ${this.nodeLabel[node.type]}`,
        message: `Tem certeza que deseja excluir "${node.name}"?${
          hasChildren ? this.childrenWarning(node) : ''
        }`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.actionSubject.next({ action: 'delete', node });
      }
    });
  }

  private childrenWarning(node: TreeNode): string {
    if (node.type === 'rank') 
      return ' Isso também removerá as tarefas e quizzes vinculados a ele.';
    
    if (node.type === 'task') 
      return ' Isso também removerá os quizzes vinculados a ela.';
    
    return '';
  }
}
